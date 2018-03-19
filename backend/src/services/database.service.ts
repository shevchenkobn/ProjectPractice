import mongoose from 'mongoose';

export interface IMongoConfig {
  host: string,
  port: string | number,
  dbName: string
}

export const terminateSignal = 'SIGINT';
export const reconnectTimeout = 5000;
let dbConnection: mongoose.Connection;
let _config: IMongoConfig;

export function initialize(config: IMongoConfig): mongoose.Connection {
  if (dbConnection) {
    return dbConnection;
  }
  _config = config;
  dbConnection = mongoose.createConnection(config.host + ':' + config.port + '/' + config.dbName);

  process.on(terminateSignal, () => {
    dbConnection.close();
    process.kill(process.pid, terminateSignal);
  });

  dbConnection.on('disconnect', () => {
    dbConnection = null;
    setTimeout(() => initialize(_config), reconnectTimeout);
  });
  return dbConnection;
}

export function getConnection(): mongoose.Connection {
  if (!dbConnection) {
    throw new Error('Connection is not created!');
  }
  return dbConnection;
}