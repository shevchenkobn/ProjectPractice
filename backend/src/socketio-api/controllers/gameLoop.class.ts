import { IBoardDocument } from "../../models/board.model";
import { findBoard } from "../../services/board.service";
import { promisify } from "util";
import { findGame } from "../../services/game.service";
import { IGameDocument } from "../../models/game.model";
import { ICellFunctionDocument } from "../../models/cellFunction.model";
import { AuthorizedSocket } from "../@types";
import { GameEventsManager } from "../services/gameEventsManager.class";
import { getService } from "../services/helpers.service";

const helperService = getService();

export interface IGameStarter {
  initiateGame(game: IGameDocument): Promise<any>;
}

export interface IGameRulesProvider {
  readonly board: IBoardDocument;
}

export class GameLoopController implements IGameRulesProvider, IGameStarter {
  private static _namespace: SocketIO.Namespace;
  private static _instances: { [boardId: string]: GameLoopController };

  public static get initialized() {
    return !!this._namespace;
  }

  public static initialize(namespace: SocketIO.Namespace) {
    if (this._namespace) {
      throw new Error('Type is initialized');
    }
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
    }
    return this._instances[boardId] as IGameStarter;
  }

  /**
   * Non-static members
   */

  private _board: IBoardDocument;
  private _defeatOnLeave: boolean;
  private _eventsManager: GameEventsManager;

  private constructor(board: IBoardDocument) {
    if (!board) {
      throw new Error('Board is undefined');
    }
    this._board = board;
    this._eventsManager = new GameEventsManager(this);
    this.parseBoard();
  }

  public get board() {
    return this._board;
  }

  async initiateGame(game: IGameDocument) {
    if (!game) {
      throw new Error('Game is undefined');
    }

    await this.initializeGame(
      game,
      await promisify(GameLoopController._namespace.to(game.id).clients)() as Array<SocketIO.Socket>
    );
  }

  private parseBoard(): void {
    let willSave = false;
    const rules = this._board.rules;
    if (!rules.playerLimits.min) {
      rules.playerLimits.min = 1;
      willSave = true;
    }
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

  private async initializeGame(game: IGameDocument, sockets: Array<SocketIO.Socket>) {
    await this.prepareGame(game);
    this.addListeners(game, sockets);
    this.startGame(game.id);
  }

  private async prepareGame(game: IGameDocument) {
    const rules = this._board.rules;

    game.stepCount = 0;
    game.playerIndex = 0;

    for (let player of game.players) {
      player.cash = rules.initialCash;
      player.cellId = 0;
    }

    if (rules.randomizeEventOptions) {
      const cellFunctionsPath = ['cellFunctions'];
      if (!this._board.extendedPopulated(cellFunctionsPath)) {
        await this._board.extendedPopulate(cellFunctionsPath);
      }

      const eventCellsWithOptions = this._board.cells.filter(
        cell => 'event' in (cell.function as ICellFunctionDocument)
          && 'options' in (cell.function as ICellFunctionDocument).event
      );
      if (eventCellsWithOptions.length) {
        const events: { [eventId: string]: Array<number> } = {};
        game.otherInfo.cellEvents = events;
        for (let cell of eventCellsWithOptions) {
          const event = cell.function as ICellFunctionDocument;
          if (!events[event.id]) {
            events[event.id] = helperService.getRange(event.event.options.length, true);
          }
        }
      }
    }


    // FIXME: probably board events should also go to otherInfo
  }

  private addListeners(game: IGameDocument, sockets: Array<SocketIO.Socket>) {
    for (let eventName of this._eventsManager.eventNames) {
      for (let socket of sockets) {
        socket.on(eventName, this._eventsManager.getListener(
          eventName,          
          game,
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