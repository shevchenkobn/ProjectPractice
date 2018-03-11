import config from 'config'; 
import appRoot from 'app-root-path';

import { SwaggerApp } from './app';
import { apiRoutes } from './routes/index';

const mongoConfig = config.get('mongodb');

const swaggerConfig = appRoot.resolve(config.get<string>('swaggerConfig'));
const uploadDir = appRoot.resolve(config.get<string>('uploadDir'));
const app = new SwaggerApp(swaggerConfig, apiRoutes, uploadDir);

app.listen(config.get<number>('port'), (app) => {
  console.log('listening');
}).catch(err => {
  console.error(err);
  process.kill(process.pid, 'SIGTERM');
});