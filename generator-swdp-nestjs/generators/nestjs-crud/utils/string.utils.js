const DASH = '-';
const UNDERSCORE = '_';
const SPACE = ' ';
const EMPTY = '';
const PATTERN = new RegExp(/[A-Z]+(?![a-z])|[A-Z]/, 'g')

const lowercase = (s) => s.toLowerCase();
const uppercase = (s) => s.toUpperCase();
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const decapitalize = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const capitalizeWords = (s) =>
  s.split(SPACE).map(capitalize).join(SPACE);

const replace = (s, targ, sub) => s.split(targ).join(sub);
const stripDashes = (s) => replace(s, DASH, SPACE);
const stripUnderscores = (s) => replace(s, UNDERSCORE, SPACE);
const stripSpaces = (s) => replace(s, SPACE, EMPTY);
const addDashes = (s) => replace(s, SPACE, DASH);
const addUnderscores = (s) => replace(s, SPACE, UNDERSCORE);

const _pipe = (a, b) => (arg) => b(a(arg));
const transformPipe = (...ops) => ops.reduce(_pipe);

const strip = transformPipe(stripDashes, stripUnderscores);
const startCase = transformPipe(strip, capitalizeWords);
const pascalCase = transformPipe(startCase, stripSpaces);
const camelCase = transformPipe(pascalCase, decapitalize);
// const kebabCase = transformPipe(strip, addDashes, lowercase);
// const snakeCase = transformPipe(strip, addUnderscores, lowercase);

const kebabCase = (str) => 
  str.replace(PATTERN, (s, ofs) => (ofs ? DASH : EMPTY) + lowercase(s))

const snakeCase = (str) => 
  str.replace(PATTERN, (s, ofs) => (ofs ? UNDERSCORE : EMPTY) + lowercase(s))

module.exports = {
  camelCase,
  pascalCase,
  kebabCase,
  snakeCase,
  lowercase,
  uppercase,
  capitalize
}