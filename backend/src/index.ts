import config from 'config'; 
import { SwaggerApp } from './app';
import path from 'path';

const mongoConfig = config.get('mongodb');

const swaggerConfig = config.get<string>('swaggerConfig');
const app = new SwaggerApp(swaggerConfig);

app.listen(config.get<number>('port'), () => {
  console.log('listening');
}).catch(err => {
  console.error(err);
  process.nextTick(() => process.exit(1));
});