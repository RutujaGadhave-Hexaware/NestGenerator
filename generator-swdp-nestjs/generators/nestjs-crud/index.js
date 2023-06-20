const Generator = require("yeoman-generator");
const { Project, SyntaxKind } = require("ts-morph");
const {
  createNameVariations,
  convertToNestDatatype,
  mockDataGenerator,
  mapToTypeormCardinality,
} = require("./utils/index.js");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.tsProject = new Project({
      tsConfigFilePath: this.destinationPath(`tsconfig.json`),
    });
  }

  initializing() {
    // preparing the data for code generation
    const receivedEntities = this.options.data.entities.reverse();
    this.entities = [];
    receivedEntities.forEach((entity) => {
      const entityNameVariations = createNameVariations(entity.name);
      let relations = entity.relations.map((relation) => {
        const relationNameVariations = createNameVariations(
          relation.relatedEntity.identifier ?? relation.relationName,
          relation.relatedEntity.name
        );
        const typeOrmMetadata = mapToTypeormCardinality(
          relation.cardinality,
          entityNameVariations,
          relationNameVariations
        );
        return {
          ...typeOrmMetadata,
          ...relationNameVariations,
        };
      });
      // all the imports that are relevant to the entity file (OneToMany etc) are here.
      let typeOrmImports = relations.reduce((acc, { cardinality }) => {
        if (cardinality === "OneToOne")
          acc = acc.concat([cardinality, "JoinColumn"]);
        else if (cardinality === "ManyToMany")
          acc = acc.concat([cardinality, "JoinTable"]);
        else acc.push(cardinality);
        return acc;
      }, []);
      this.entities.push({
        ...entityNameVariations,
        fields: convertToNestDatatype(entity.fields),
        relations,
        typeOrmImports: [...new Set(typeOrmImports)], // removing the duplicate imports
      });
    });
  }

  writing() {
    this.entities.forEach((entity) => {
      this._generateEntity(entity);
      this._generateController(entity);
      this._generateService(entity);
      this._generateModule(entity);
    });
    this._updateAppModuleFile()
  }

  _generateEntity(entity) {
    // create entity
    this.fs.copyTpl(
      this.templatePath("code/entities/entity.ts.ejs"),
      this.destinationPath(`src/entities/${entity.selector}.entity.ts`),
      entity
    );
    this.fs.commit();
  }

  _generateModule(entity) {
    // create module
    this.fs.copyTpl(
      this.templatePath("code/modules/module.ts.ejs"),
      this.destinationPath(`src/modules/${entity.selector}.module.ts`),
      entity
    );
  }

  _generateController(entity) {
    // create controller and controller.spec
    this.fs.copyTpl(
      this.templatePath("code/controllers/controller.ts.ejs"),
      this.destinationPath(`src/controllers/${entity.selector}.controller.ts`),
      entity
    );
    this.fs.copyTpl(
      this.templatePath("code/controllers/__test__/controller.spec.ts.ejs"),
      this.destinationPath(
        `src/controllers/__test__/${entity.selector}.controller.spec.ts`
      ),
      { ...entity, mockData: mockDataGenerator(entity.fields) }
    );
  }

  _generateService(entity) {
    // create service and service.spec
    this.fs.copyTpl(
      this.templatePath("code/services/service.ts.ejs"),
      this.destinationPath(`src/services/${entity.selector}.service.ts`),
      entity
    );
    this.fs.copyTpl(
      this.templatePath("code/services/__test__/service.spec.ts.ejs"),
      this.destinationPath(
        `src/services/__test__/${entity.selector}.service.spec.ts`
      ),
      { ...entity, mockData: mockDataGenerator(entity.fields) }
    );
  }

  _updateAppModuleFile() {
    // registering the entity's module in the app module

    // fetching app.module.ts file
    const sourceFile = this.tsProject.getSourceFile(
      this.destinationPath(`src/app.module.ts`)
    );

    // adding imports for module and entity
    const importDeclarations = this.entities.reduce(
      (acc, cur) =>
        acc.concat([
          {
            namedImports: `${cur.model}Module`,
            moduleSpecifier: `./modules/${cur.selector.toLowerCase()}.module`,
          },
          {
            namedImports: `${cur.model}`,
            moduleSpecifier: `./entities/${cur.selector.toLowerCase()}.entity`,
          },
        ]),
      []
    );
    sourceFile.addImportDeclarations(importDeclarations);
    // fetching the imports array inside @Module decorator's config
    const moduleClass = sourceFile.getClass((c) =>
      c.getText().includes("@Module")
    );
    const moduleDecorator = moduleClass.getDecorator("Module");
    const moduleArgument = moduleDecorator.getArguments()[0];
    const declarationsProp = moduleArgument
      .getDescendants()
      .find(
        (d) =>
          d.getKind() === SyntaxKind.PropertyAssignment &&
          d.compilerNode.name.getText() === "imports"
      );
    const importArray = declarationsProp.getFirstChildByKindOrThrow(
      SyntaxKind.ArrayLiteralExpression
    );

    const importArrayElements = this.entities.map(
      (entity) => `${entity.model}Module`
    );
    importArray.addElements(importArrayElements);
    sourceFile.save();
    this.tsProject.save();
  }
};
