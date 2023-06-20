const classValidatorMap = {
  "int": "IsNumber",
  "decimal": "IsNumber",
  "string": "IsString",
  "bool": "IsBoolean",
  "datetime": "IsDateString",
  "required": "IsNotEmpty",
  "unique": "IsUnique",
  "maxLength": "MaxLength",
  "minLength": "MinLength",
  "maxIntValue": "Max",
  "minIntValue": "Min",
  "maxDecimalValue": "Max",
  "minDecimalValue": "Min",
};

const dataTypeMap = {
  "int": "number",
  "string": "string",
  "bool": "boolean",
  "decimal": "number",
  "datetime": "Date",
  "default": "string",
};

const getNestJSDatatype = (datatype) => dataTypeMap[datatype];

const getImportStatements = (fields) => {
  let importStatements = fields.map(field => classValidatorMap[field.datatype])
  fields.forEach(({ validations }) => {
    importStatements = [...importStatements, ...Object.keys(validations).map(v => classValidatorMap[v])];
  })
  importStatements = [...new Set(importStatements)];
  return importStatements;
}

const getDecorators = (datatype, validations) => {
  const result = [];
  for (let [key, value] of Object.entries(validations)) {
    let decorator = `@${classValidatorMap[key]}(${value?.value ?? ''})` 
    result.push(decorator);
  }
  result.push(`@${classValidatorMap[datatype]}()`)
  return result;
}

module.exports = {
  getImportStatements,
  getDecorators,
  getNestJSDatatype,
}
