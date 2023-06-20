const Generator = require("yeoman-generator");
const { getImportStatements, getDecorators, getNestJSDatatype } = require('./utils');
const { pascalCase, kebabCase } = require("./utils/string.utils");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
  }

  writing() {
    const entity = this.options.data;
    this.log(entity)
    const modifiedFields = entity.fields.map(field => ({
      name: field.name,
      datatype: getNestJSDatatype(field.datatype),
      validations: getDecorators(field.datatype, field.validations),
    }));
    this.log(entity.fields)
    this.fs.copyTpl(
      this.templatePath('code/dto.ts.ejs'),
      this.destinationPath(`src/dtos/${kebabCase(entity.name)}.dto.ts`),
      {
        entityName: pascalCase(entity.name),
        importStatements: getImportStatements(entity.fields),
        fields: modifiedFields,
      },  
    );

  }
}
