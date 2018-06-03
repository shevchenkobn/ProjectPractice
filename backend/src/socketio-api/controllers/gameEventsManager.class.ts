import { GameLoopController, IGameRulesProvider } from "../controllers/gameLoop.class";
import { IGameDocument } from "../../models/game.model";
import { AuthorizedSocket } from "../@types";
import { findGame } from "../../services/game.service";
import { GameTimeouts } from "../services/gameTimeouts.class";

export type SocketEventHanler = (this: GameEventsManager, game: IGameDocument, socket: AuthorizedSocket, ...args: Array<any>) => any;

export type SocketEventListeners = { [eventName: string]: SocketEventHanler };

export class GameEventsManager {
  private _timeouts: GameTimeouts;
  private _rulesProvider: IGameRulesProvider;
  private _listeners: SocketEventListeners = {
    step(game, socket) {
      
    }
  }

  public constructor(rulesProvider: IGameRulesProvider) {
    this._timeouts = new GameTimeouts();
    this._rulesProvider = rulesProvider;
  }

  public get eventNames() {
    return Object.keys(this._listeners);
  }

  public getListener(eventName: string, socket: AuthorizedSocket): (...args: Array<any>) => any {
    return listenerWrapper.bind(this, socket, this._listeners[eventName]);
  }
}

async function listenerWrapper(socket: AuthorizedSocket, listener: SocketEventHanler, ...args: Array<any>) {
  const game = await findGame(socket.data.gameId);
  if (game.status === 'playing') {
    await listener.call(this, game, socket, ...args);
    await game.save();
  }
}