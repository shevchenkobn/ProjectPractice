import mongoose, { Connection, ConnectionOptions } from 'mongoose';

export interface IMongoConfig {
  host: string,
  port: string | number,
  dbName: string
}

export const terminateSignal = 'SIGINT';
export const connectionOptions: ConnectionOptions = {
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 1000
};
Object.freeze(connectionOptions);
let dbConnection: Connection;
let _config: IMongoConfig;

export function initialize(config: IMongoConfig): Connection {
  if (dbConnection) {
    return dbConnection;
  }
  _config = config;
  dbConnection = mongoose.createConnection(
    config.host + ':' + config.port + '/' + config.dbName,
    connectionOptions
  );

  dbConnection.on('connecting', () => {
    //TODO: add some logging here
  });

  dbConnection.on('connected', () => {
    //TODO: add some logging here
  });

  dbConnection.on('disconnecting', () => {
    //TODO: add some logging here
  });

  dbConnection.on('disconnected', () => {
    //TODO: add some logging here
  });

  dbConnection.on('reconnectFailed', () => {
    //TODO: add some logging here
  });

  process.on(terminateSignal, () => {
    dbConnection.close();
    process.kill(process.pid, terminateSignal);
  });
  return dbConnection;
}

export function getConnection(): Connection {
  if (!dbConnection) {
    throw new Error('Connection is not created!');
  }
  return dbConnection;
}