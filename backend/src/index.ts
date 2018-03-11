import config from 'config'; 
import appRoot from 'app-root-path';
import mongoose from 'mongoose';
import { Middleware } from 'koa';

import { bindUser } from './models/user.model';

interface IMongoConfig {
  host: string,
  port: string | number,
  dbName: string
}
const mongoConfig = config.get<IMongoConfig>('mongodb');
const dbConnection: any = mongoose.createConnection(mongoConfig.host + ':' + mongoConfig.port + '/' + mongoConfig.dbName);
dbConnection.catch(softExit);
const User = bindUser(dbConnection);

import { SwaggerApp } from './app';
import { apiRoutes } from './routes';
import passport from './services/passport-auth.service';

const middlewares: Middleware[] = [];
middlewares.push(passport.initialize(), passport.session());

const swaggerConfigPath = appRoot.resolve(config.get<string>('swaggerConfig'));
const uploadDir = appRoot.resolve(config.get<string>('uploadDir'));
const app = new SwaggerApp(swaggerConfigPath, apiRoutes, uploadDir, middlewares);

app.listen(config.get<number>('port'), (app) => {
  console.log('listening');
}).catch(softExit);

function softExit(err: any) {
  console.error(err);
  process.kill(process.pid, 'SIGTERM');
}