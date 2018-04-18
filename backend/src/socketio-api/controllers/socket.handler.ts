import { SocketHandler } from '../@types';

export const connectionHandler: SocketHandler = socket => {
  console.log(socket);
}