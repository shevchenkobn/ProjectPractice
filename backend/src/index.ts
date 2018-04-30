import config from 'config'; 
import appRoot from 'app-root-path';
import path from 'path';

import { SwaggerApp, IHandlersArray } from './app';
import { getRoutes } from './routes/index';
import { initialize as initializeModels } from './models';
import UserInititializer, { IUserModel } from './models/user.model';
import { initialize as initializeMongoose, IMongoConfig, terminateSignal } from './services/database.service';
import { initialize as initializePassport } from './services/passport.service';
import { errorHandler, notFoundHandler } from './services/error-handler.service';
import { Handler, ErrorRequestHandler } from 'express';
import { getService as getAuthService } from './services/authentication.service';
import { getConfig as getSocketIoConfig } from './socketio-api';

const mongoConfig = config.get<IMongoConfig>('mongodb');
let dbConnection = initializeMongoose(mongoConfig);
(async () => {
  dbConnection = await dbConnection;
  const models = initializeModels(dbConnection);
  const passport = initializePassport(UserInititializer.getModel());

  const middlewares: IHandlersArray = {
    before: [passport.initialize()],
    after: [errorHandler, notFoundHandler]
  };

  const swaggerConfigPath = appRoot.resolve(config.get<string>('swaggerConfig'));
  const uploadDir = appRoot.resolve(config.get<string>('uploadDir'));
  const app = new SwaggerApp({
    appConfig: {
      express: {
        middlewares,
        uploadDir,
        routes: getRoutes()
      },
      socketio: getSocketIoConfig()
    },
    swagger: {
      filepath: swaggerConfigPath,
      securityOptions: {
        Bearer: getAuthService().swaggerBearerJwtChecker
      },
      routerOptions: {
        controllers: path.resolve(__dirname, './rest-api/controllers'),
        // useStubs: true
      },
      validatorOptions: {
        validateResponse: false
      }
    }
  });

  const server = await app.listen(config.get<number>('port'), app => {
    console.log('listening');
  });
})().catch(softExit);

function softExit(err: any) {
  console.error(err);
  process.kill(process.pid, terminateSignal);
}