import config from 'config'; 
import { App } from './app';
import * as swagger from 'swagger2';

const mongoConfig = config.get('mongodb');

const app = new App([]);
app.listen(config.get<number>('port'));