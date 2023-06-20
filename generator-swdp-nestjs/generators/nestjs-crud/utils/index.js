const pluralize = require('pluralize');
const { camelCase, pascalCase, kebabCase, lowercase } = require("./string.utils");

/**
 * 
 * @param {*} model -> the parent entity 
 * @param {*} relation -> the related entity / the parent entity itself
 * @returns an object of different variations of names.
 * This function will take in the entity name and return in camelCase, PascalCase and kebab-case
 * along with plural forms for each case. 
 * This will be useful inside the ejs templates.
 */
const createNameVariations = (model, relation = "") => {
  if (!relation) relation = model;
  const modelPlural = pluralize(model);
  const relationPlural = pluralize(relation);
  return {
    ref: camelCase(model),
    refs: camelCase(modelPlural),
    model: pascalCase(relation),
    models: pascalCase(relationPlural),
    selector: kebabCase(relation),
    selectors: kebabCase(relationPlural),
  }
}

/**
 * 
 * @param {*} cardinality OneToOne | OneToMany | ManyToOne | ManyToMany
 * @param {*} entity The parent entity's name variations object
 * @param {*} relation The related entity's name variation object
 * @returns an object with the decorater that should be added and the property definition.
 * This will be useful in the ejs template.
 */
const mapToTypeormCardinality = (cardinality, entity, relation) => {
  const typeOrmCardinality = {
    'OneToOne': {
      cardinality: 'OneToOne',
      decorator: `@OneToOne(() => ${relation.model}, { cascade: true })\n  @JoinColumn()`,
      definition: `${relation.ref}: ${relation.model}`
    },
    'OneToMany': {
      cardinality: 'OneToMany',
      decorator: `@OneToMany(() => ${relation.model}, (${lowercase(relation.model)}) => ${lowercase(relation.model)}.${entity.ref}, { cascade: true })`,
      definition: `${relation.refs}: ${relation.model}[]`,
    },
    'ManyToOne': {
      cardinality: 'ManyToOne',
      decorator: `@ManyToOne(() => ${relation.model}, (${lowercase(relation.model)}) => ${lowercase(relation.model)}.${entity.refs})`,
      definition: `${lowercase(relation.model)}: ${relation.model}`
    },
    'ManyToMany': {
      cardinality: 'ManyToMany',
      decorator: `@ManyToMany(() => ${relation.model}, { cascade: true })\n  @JoinTable()`,
      definition: `${relation.refs}: ${relation.model}[]`
    },
  };

  return typeOrmCardinality[cardinality];
}

/**
 * 
 * @param {*} fields { name: string; datatype: string }[] 
 * @returns the appropriate nest datatype for all the fields.
 */
const convertToNestDatatype = (fields) => {
  const dataTypeMap = {
    "integer": "number",
    "string": "string",
    "boolean": "boolean",
    "decimal": "number",
    "datetime": "Date",
    "number": "number",
    "int32": "number",
    "int64": "number",
    "default": "string",
  };
  return fields.map(field => {
    const type = field.datatype.toLowerCase();
    field.datatype = dataTypeMap[type] ?? dataTypeMap.default;
    return field;
  })
}

/**
 * 
 * @param {*} fields { name: string; datatype: string }[] 
 * @returns mock data for writing unit tests.
 */
function mockDataGenerator(fields) {
  const mockData = {};
  const mockDataMap = {
    "number": (Math.floor(((Math.random() * 100) + 1))),
    "string": `"rapidx"`,
    "boolean": true,
    "Date": new Date(),
  }
  fields.forEach(field => {
    const value = mockDataMap[field.datatype];
    mockData[field.name] = value;
  });
  return mockData;
}

module.exports = {
  createNameVariations,
  convertToNestDatatype,
  mockDataGenerator,
  mapToTypeormCardinality
}
