const { createNameVariations, convertToNestDatatype, mockDataGenerator, mapToTypeormCardinality } = require("../utils")

describe("createNameVariations", () => {
  it("should return name variations when model alone is passed", async () => {
    const nameVariations = createNameVariations("userStory")
    const expectedNameVariations = {
      ref: "userStory",
      refs: "userStories",
      model: "UserStory",
      models: "UserStories",
      selector: "user-story",
      selectors: "user-stories" 
    }
    expect(nameVariations).toMatchObject(expectedNameVariations);
  });

  it("should return name variations when model and relation are passed", async () => {
    const nameVariations = createNameVariations("userStory", "task")
    const expectedNameVariations = {
      ref: "userStory",
      refs: "userStories",
      model: "Task",
      models: "Tasks",
      selector: "task",
      selectors: "tasks" 
    }
    expect(nameVariations).toMatchObject(expectedNameVariations);
  })
});

describe("convertToNestDatatype", () => {
  const fields = [
    { name: "name", datatype: "string" },
    { name: "age", datatype: "integer" },
    { name: "count", datatype: "number" },
    { name: "total", datatype: "int32" },
    { name: "mark", datatype: "int64" },
    { name: "isActive", datatype: "boolean" },
    { name: "dateOfBirth", datatype: "datetime" },
    { name: "ratings", datatype: "decimal" },
    { name: "complexNumber", datatype: "complex" },
  ];
  const expectedfields = [
    { name: "name", datatype: "string" },
    { name: "age", datatype: "number" },
    { name: "count", datatype: "number" },
    { name: "total", datatype: "number" },
    { name: "mark", datatype: "number" },
    { name: "isActive", datatype: "boolean" },
    { name: "dateOfBirth", datatype: "Date" },
    { name: "ratings", datatype: "number" },
    { name: "complexNumber", datatype: "string" },
  ];
  
  it("should return the appropriate datatypes", async () => {
    const result = convertToNestDatatype(fields)
    result.forEach((res, i) => {
      expect(res).toMatchObject(expectedfields[i]);
    })
  });

});

describe("mockDataGenerator", () => {
  const fields = [
    { name: "name", datatype: "string" },
    { name: "age", datatype: "number" },
    { name: "count", datatype: "number" },
    { name: "total", datatype: "number" },
    { name: "mark", datatype: "number" },
    { name: "isActive", datatype: "boolean" },
    { name: "dateOfBirth", datatype: "Date" },
    { name: "ratings", datatype: "number" },
    { name: "complexNumber", datatype: "string" },
  ];

  it("should return mock data for the respective datatype", () => {
    const res = mockDataGenerator(fields);
    fields.forEach((field) => {
      if (field.datatype === 'Date') field.datatype = 'object';
      expect(typeof res[field.name]).toEqual(field.datatype);
    })
  })
});

describe('mapToTypeormCardinality', () => {
  const entity = {
    ref: "mobile",
    refs: "mobiles",
    model: "Mobile",
    models: "Mobiles",
  };
  let cardinality = '';
  const relation = {
    ref: "user",
    refs: "users",
    model: "User",
    models: "Users"
  };
  it("should return the appropriate result for OneToOne cardinality", async () => {
    cardinality = 'OneToOne'
    const result = mapToTypeormCardinality(cardinality, entity, relation);
    const expectedResult = {
      cardinality,
      decorator: `@OneToOne(() => User, { cascade: true })\n  @JoinColumn()`,
      definition: `user: User`
    };
    expect(result).toMatchObject(expectedResult);
  });

  it("should return the appropriate result for ManyToMany cardinality", async () => {
    cardinality = 'ManyToMany'
    const result = mapToTypeormCardinality(cardinality, entity, relation);
    const expectedResult = {
      cardinality,
      decorator: `@ManyToMany(() => User, { cascade: true })\n  @JoinTable()`,
      definition: `users: User[]`
    };
    expect(result).toMatchObject(expectedResult);
  });

  it("should return the appropriate result for OneToMany cardinality", async () => {
    cardinality = 'OneToMany'
    const result = mapToTypeormCardinality(cardinality, entity, relation);
    const expectedResult = {
      cardinality,
      decorator: `@OneToMany(() => User, (user) => user.mobile, { cascade: true })`,
      definition: `users: User[]`
    };
    expect(result).toMatchObject(expectedResult);
  });

  it("should return the appropriate result for ManyToOne cardinality", async () => {
    cardinality = 'ManyToOne';
    entity.refs = "users";
    const result = mapToTypeormCardinality(cardinality, relation, entity);
    const expectedResult = {
      cardinality,
      decorator: `@ManyToOne(() => Mobile, (mobile) => mobile.users)`,
      definition: `mobile: Mobile`
    };
    expect(result).toMatchObject(expectedResult);
  });
})
