const Generator = require("yeoman-generator");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
  }

  writing() {
    const { data } = this.options;
    const config = {
      name: data.com_name,
      description: data.description,
      author: data.author,
    };

    this.fs.copy(this.templatePath("code"), this.destinationRoot(), {
      globOptions: {
        dot: true,
      },
    });
    this.fs.copyTpl(
      this.templatePath("code/package.json"),
      this.destinationPath("package.json"),
      { config }
    );
    this.fs.copyTpl(
      this.templatePath("code/.env"),
      this.destinationPath(".env"),
      { config }
    );

    this.fs.copyTpl(
      this.templatePath("code/catalog-info.yaml"),
      this.destinationPath("catalog-info.yaml")
  )
  }
};
