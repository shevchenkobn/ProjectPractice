export class GameTimeouts {  
  private _gameTimeouts: {[gameId: string]: NodeJS.Timer} = {};

  set(gameId: string, timeout: number, callback: Function, callbackThis: any, ...args: Array<any>) {
    if (this._gameTimeouts[gameId]) {
      throw new Error('A timeout for the game is already set!');
    } else {
      this._gameTimeouts[gameId] = global.setTimeout(this.gameTimeout.bind(this, gameId, callback, callbackThis, ...args), timeout);
    }
  }

  clear(gameId: string) {
    if (this._gameTimeouts[gameId]) {
      clearTimeout(this._gameTimeouts[gameId]);
      delete this._gameTimeouts[gameId];
    }
  }

  has(gameId: string) {
    return !!this._gameTimeouts[gameId];
  }

  private gameTimeout(gameId: string, callback: Function, callbackThis: any, ...args: Array<any>) {
    this.clear(gameId);
    callback.apply(callbackThis, args);
  }
}