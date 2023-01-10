export enum PrettyTypes {
  json = 'json',
  html = 'html',
  xml = 'xml',
  plaintext = 'plaintext',
}
export const PrettyTypesMapping: { [k in keyof typeof PrettyTypes]: string } = {
  [PrettyTypes.json]: 'Json',
  [PrettyTypes.html]: 'Html',
  [PrettyTypes.xml]: 'Xml',
  [PrettyTypes.plaintext]: 'Text',
};

export const ALL_SUFFIX_ARR = [
  'yaml',
  'yml',
  'json',
  'ini',
  'properties',
  'gitconfig',
  'toml',
  'conf',
];

export const DEFAULT_CONFIGMAP_TYPE = 'text';
export const DEFAULT_CONFIGMAP_MONACO_LANG = 'plaintext';

export const PrettyConfigmapTypes = [
  { text: 'yaml', suffix: ['yaml', 'yml'], grammar: 'yaml' },
  { text: 'json', suffix: ['json'], grammar: 'json' },
  { text: 'ini', suffix: ['ini', 'properties', 'gitconfig'], grammar: 'ini' },
  { text: 'toml', suffix: ['toml'], grammar: 'sb' },
  { text: 'conf', suffix: ['conf'], grammar: 'sb' },
  { text: 'text', suffix: [], grammar: DEFAULT_CONFIGMAP_MONACO_LANG },
];
