import * as swagger from 'swagger2';
import config from 'config';
import dotProp from 'dot-prop';

const configureProps: Array<any> = [
  [
    (host: string, port: string): string => {
      return host + ':' + port;
    },
    ['host', 'port'],
    'host'
  ],
  ['apiPath', 'basePath']
];

export function loadSwaggerDocument(filePath: string): swagger.Document {
  const document = swagger.loadDocumentSync(filePath);
  if (!swagger.validateDocument(document)) {
    throw new TypeError(`${filePath} does not conform to the Swagger 2.0 schema`);
  }
  for (let propConf of configureProps) {
    if (Array.isArray(propConf)) {
      if (typeof propConf[0] === 'function') {
        const params: any[] = [];
        for (let prop of propConf[1]) {
          params.push(config.get<any>(prop));
        }
        dotProp.set(document, propConf[2], propConf[0](...params));
      } else {
        dotProp.set(document, propConf[1], config.get<any>(propConf[0]));
      }
    } else {
      dotProp.set(document, propConf, config.get<any>(propConf));
    }
  }
  return document;
}
