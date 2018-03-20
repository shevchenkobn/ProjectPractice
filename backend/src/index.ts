import config from 'config'; 
import appRoot from 'app-root-path';
import { Middleware } from 'koa';

import { _koaSwaggerApp } from './app';
import { initialize as initializeRoutes } from './routes/index';
import { initialize as initializeModels } from './models';
import UserInititializer, { IUserModel } from './models/user.model';
import { initialize as initializeMongoose, IMongoConfig, terminateSignal } from './services/database.service';
import { initialize as initializePassport } from './services/passport.service';

const mongoConfig = config.get<IMongoConfig>('mongodb');
let dbConnection = initializeMongoose(mongoConfig);
(async () => {
  dbConnection = await dbConnection;
  const models = initializeModels(dbConnection);
  const passport = initializePassport(models[UserInititializer.getModelName()] as IUserModel);

  const middlewares: Array<Middleware> = [];
  middlewares.push(passport.initialize());

  const swaggerConfigPath = appRoot.resolve(config.get<string>('swaggerConfig'));
  const uploadDir = appRoot.resolve(config.get<string>('uploadDir'));
  const app = new _koaSwaggerApp(swaggerConfigPath, initializeRoutes(), uploadDir, middlewares);

  app.listen(config.get<number>('port'), (app) => {
    console.log('listening');
  })
})().catch(softExit);

function softExit(err: any) {
  console.error(err);
  process.kill(process.pid, terminateSignal);
}