import { IBoardDocument } from "../../models/board.model";
import { findBoard } from "../../services/board.service";
import { findGame } from "../../services/game.service";
import { IGameDocument } from "../../models/game.model";
import { ICellFunctionDocument } from "../../models/cellFunction.model";
import { AuthorizedSocket } from "../@types";
import { GameEventsManager } from "./gameEventsManager.class";
import { initialize, getClientIds, disconnectSocket, getRange } from "../services/helpers.service";
import { ObjectId } from "bson";
import { ISessionDocument } from "../../models/session.model";
import { getId } from "../../services/helpers.service";

export interface IGameManager {
  initiateGame(game: IGameDocument): Promise<any>;
  tryWinGame(game: IGameDocument): Promise<boolean>;
}

export interface IGameRulesProvider {
  readonly board: IBoardDocument;
}

export class GameLoopController implements IGameRulesProvider, IGameManager {
  private static _namespace: SocketIO.Namespace;
  private static _instances: { [boardId: string]: GameLoopController };

  public static get initialized() {
    return !!this._namespace;
  }

  public static initialize(namespace: SocketIO.Namespace) {
    if (this._namespace) {
      throw new Error('Type is initialized');
    }
    initialize();
    if (!namespace) {
      throw new Error('namespace is undefined');
    }
    this._namespace = namespace;
  }

  public static async getInstance(boardId: string) {
    if (!this._namespace) {
      throw new Error('Call initialize with namespace first!');
    }
    if (!this._instances[boardId]) {
      this._instances[boardId] = new GameLoopController(await findBoard(boardId));
      await this._instances[boardId].initialize();
    }
    return this._instances[boardId] as IGameManager;
  }

  /**
   * Non-static members
   */

  private _board: IBoardDocument;
  private _defeatOnLeave: boolean;
  private _eventsManager: GameEventsManager;
  private _initialized: boolean;

  private constructor(board: IBoardDocument) {
    if (!board) {
      throw new Error('Board is undefined');
    }
    this._board = board;
    this._initialized = false;
    this._eventsManager = new GameEventsManager(this);
    this.parseBoard();
  }

  public get board() {
    return this._board;
  }

  async initiateGame(game: IGameDocument) {
    if (!this._initialized) {
      throw new Error('Instance is not initialized!');
    }
    if (!game) {
      throw new Error('Game is undefined');
    }

    const clients: Array<any> = await getClientIds(GameLoopController._namespace, game.id);
    clients.forEach((id, i, arr) => {
      arr[i] = GameLoopController._namespace.connected[id];
    });

    await this.initializeGame(
      game,
      clients as Array<AuthorizedSocket>
    );
  }

  async tryWinGame(game: IGameDocument) {
    if (!this._initialized) {
      throw new Error('Instance is not initialized!');
    }
    const activePlayersIndexes = game.players.reduce((indexesArray, player, index) => {
      if (player.status === 'active') {
        indexesArray.push(index);
      } 
      return indexesArray;
    }, [] as Array<number>);
    if (activePlayersIndexes.length === 1) {
      const winnerIndex = activePlayersIndexes[0];
      game.winner = game.players[winnerIndex].user;
      game.status = 'finished';
      await game.save();
      const socketIds = await getClientIds(GameLoopController._namespace, game.id);
      for (let socketId of socketIds) {
        const socket = GameLoopController._namespace.connected[socketId] as AuthorizedSocket;
        if (
          socket.data.sessionId === getId(game.players[winnerIndex].session)
        ) {
          socket.emit('winner') // TODO: use from event handles
          disconnectSocket(socket, {
            message: 'Game is finished. You are the winner.'
          });
        }
      }
      return true;
    } else {
      return false;
    }
  }

  private async initialize() {
    const paths = ['cellFunctions'];
    if (!this._board.extendedPopulated(paths).cellFunctions) {
      await this._board.extendedPopulate(paths);
    }
    this._initialized = true;
  }

  private parseBoard(): void {
    let willSave = false;
    const rules = this._board.rules;
    for (let dice of rules.dices) {
      if (!dice.min) {
        dice.min = 1;
        willSave = true;
      }
    }
    this._defeatOnLeave = rules.events.some(event => event.type === 'leave');

    if (willSave) {
      this._board.save().catch(err => {
        //TODO: write to logs
      });
    }
  }

  private async initializeGame(game: IGameDocument, sockets: Array<AuthorizedSocket>) {
    await this.prepareGame(game);
    this.addListeners(game, sockets);
    this.startGame(game.id);
  }

  private async prepareGame(game: IGameDocument) {
    const rules = this._board.rules;

    game.stepCount = 0;
    game.playerIndex = 0;

    game.players = game.players.filter(player => player.status === 'active');

    for (let player of game.players) {
      player.cash = rules.initialCash;
      player.cellId = 0;
    }

    if (rules.randomizeEventOptions) {
      const cellFunctionsPath = ['cellFunctions'];
      if (!this._board.extendedPopulated(cellFunctionsPath).cellFunctions) {
        await this._board.extendedPopulate(cellFunctionsPath);
      }

      const eventCellsWithOptions = this._board.cells.filter(
        cell => 'event' in (cell.function as ICellFunctionDocument)
          && 'options' in (cell.function as ICellFunctionDocument).event
      );
      if (eventCellsWithOptions.length) {
        const events: { [eventId: string]: Array<number> } = {};
        game.otherInfo.cellEventOptions = events;
        for (let cell of eventCellsWithOptions) {
          const event = cell.function as ICellFunctionDocument;
          if (!events[event.id]) {
            events[event.id] = getRange(event.event.options.length, true);
          }
        }
      }
    }
    
    // FIXME: probably board events should also go to otherInfo
    await game.save();
  }

  private addListeners(game: IGameDocument, sockets: Array<AuthorizedSocket>) {
    for (let eventName of this._eventsManager.eventNames) {
      for (let socket of sockets) {
        socket.on(eventName, this._eventsManager.getListener(
          eventName,
          socket as AuthorizedSocket
        ));
      }
    }
  }

  private startGame(roomId: string) {
    // TODO: add documentation
    GameLoopController._namespace.to(roomId).emit('start');
  }
}