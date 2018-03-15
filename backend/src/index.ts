import config from 'config'; 
import appRoot from 'app-root-path';
import { Middleware } from 'koa';

import { SwaggerApp } from './app';
import { initialize as initializeRoutes } from './routes/index';
import { initialize as initializeModels } from './models';
import UserInititializer from './models/user.model';
import { initialize as initializePassport } from './services/passport-auth.service';
import { initialize as initializeMongoose, IMongoConfig, terminateSignal } from './services/database.service';

const mongoConfig = config.get<IMongoConfig>('mongodb');
const dbConnection = initializeMongoose(mongoConfig);
const models = initializeModels(dbConnection);
const passport = initializePassport(models[UserInititializer.getModelName()]);

const middlewares: Array<Middleware> = [];
middlewares.push(passport.initialize(), passport.session());

const swaggerConfigPath = appRoot.resolve(config.get<string>('swaggerConfig'));
const uploadDir = appRoot.resolve(config.get<string>('uploadDir'));
const app = new SwaggerApp(swaggerConfigPath, initializeRoutes(), uploadDir, middlewares);

app.listen(config.get<number>('port'), (app) => {
  console.log('listening');
}).catch(softExit);

function softExit(err: any) {
  console.error(err);
  process.kill(process.pid, terminateSignal);
}