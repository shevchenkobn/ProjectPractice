import config from 'config'; 
import appRoot from 'app-root-path';

import { SwaggerApp, IHandlersArray } from './app';
import { initialize as initializeRoutes } from './routes/index';
import { initialize as initializeModels } from './models';
import UserInititializer, { IUserModel } from './models/user.model';
import { initialize as initializeMongoose, IMongoConfig, terminateSignal } from './services/database.service';
import { initialize as initializePassport } from './services/passport.service';
import { errorHandler } from './services/error-handler.service';
import { Handler, ErrorRequestHandler } from 'express';

const mongoConfig = config.get<IMongoConfig>('mongodb');
let dbConnection = initializeMongoose(mongoConfig);
(async () => {
  dbConnection = await dbConnection;
  const models = initializeModels(dbConnection);
  const passport = initializePassport(<IUserModel>models[UserInititializer.getModelName()]);

  const middlewares: IHandlersArray = {
    before: [passport.initialize()],
    after: [errorHandler]
  };

  const swaggerConfigPath = appRoot.resolve(config.get<string>('swaggerConfig'));
  const uploadDir = appRoot.resolve(config.get<string>('uploadDir'));
  const app = new SwaggerApp(swaggerConfigPath, middlewares, uploadDir, initializeRoutes());

  app.listen(config.get<number>('port'), app => {
    console.log('listening');
  })
})().catch(softExit);

function softExit(err: any) {
  console.error(err);
  process.kill(process.pid, terminateSignal);
}