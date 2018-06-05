import { GameLoopController, IGameRulesProvider } from "../controllers/gameLoop.class";
import { IGameDocument } from "../../models/game.model";
import { AuthorizedSocket } from "../@types";
import { findGame } from "../../services/game.service";
import { GameTimeouts } from "../services/gameTimeouts.class";
import { getIntegerBetween } from "../services/helpers.service";
import { IBoardDocument } from "../../models/board.model";
import { ICellFunctionDocument } from "../../models/cellFunction.model";
import { ObjectID, ObjectId } from "bson";
import { findCellFunction } from "../../services/cellFunction.service";
import { from } from 'linq';
// import CellFunctionInitializer from '../../services/ce'

export type SocketEventHanler = (this: GameEventsManager, game: IGameDocument, socket: AuthorizedSocket, ...args: Array<any>) => any;

export type SocketEventHandlers = { [eventName: string]: SocketEventHanler };

export class GameEventsManager {
  private _timeouts: GameTimeouts;
  private _rulesProvider: IGameRulesProvider;
  private _rules: IBoardDocument['rules'];
  private _cells: IBoardDocument['cells'];

  private _listeners: SocketEventHandlers = {
    
  }
  private _handlers: SocketEventHandlers = {
    async step(game, socket) {
      const player = game.players[game.playerIndex];
      const steps = this._rules.dices.map(range => getIntegerBetween(range.min, range.max));
      const totalSteps = steps.reduce((sum, step) => sum + step);

      const events: Array<ICellFunctionDocument> = [];
      let lastEventCellId = -1;
      let newCellId = player.cellId + 1;
      for (let i = 0; i < totalSteps; i++) {
        const cellFunc = this._cells[newCellId].function as ICellFunctionDocument;
        if (cellFunc.event) {
          if (cellFunc.event.triggers.includes('hover')) {
            events.push(cellFunc)
            lastEventCellId = newCellId;
          }
        }
        newCellId = this._cells[newCellId].next ? this._cells[newCellId].next : newCellId + 1;
      }

      player.cellId = newCellId;
      for (let event of events) {
        await this._handlers.handleEvent.call(this, game, socket, event);
      }
      const cellFunc = this._cells[newCellId].function as ICellFunctionDocument;
      if (cellFunc.event) {
        if (
          cellFunc.event.triggers.includes('stop')
          && newCellId !== lastEventCellId
        ) {
          await this._handlers.handleEvent.call(this, game, socket, cellFunc);
        }
      } else if (cellFunc.building) {

      }
    },

    async handleEvent(game, socket, func: ICellFunctionDocument) {
      if (!func.event) {
        return;
      }

      let action: any;
      if (func.event.options) {
        const indexes = game.otherInfo.cellEventOptions[func.id];
        action = func.event.options[indexes[0]];
        indexes.push(indexes.shift());
        while (Object.keys(action).length === 1 && 'optionId' in action) {
          action = func.event.options.findIndex(option => option.optionId === action.optionId);
        }
      } else {
        action = func.event.action;
      }


      const player = game.players[game.playerIndex];
      if (action.cash) {
        player.cash += action.cash;
      }
      if (action.cashDescriptor) {
        const descriptor = action.cashDescriptor;
        switch (descriptor.type) {
          case 'building.fee':
            let buildingsIds = player.buildings;
            if (!descriptor.countMortgaged && this._rules.building.fee.monopoly.mortgageBreaks) {
              buildingsIds = buildingsIds.filter(objectId => !player.mortgaged.findIndex(
                object2Id => (objectId as ObjectID).toHexString() === (object2Id as ObjectID).toHexString()
              ));
            }
            const buildings = (await Promise.all(
              buildingsIds.map(objectId => findCellFunction((objectId as ObjectId).toHexString()))
            ));
            const percentage = descriptor.each.percentage as number;
            let feeSum = 0;
            if (
              descriptor.countMonopolistic
              || this._rules.building.improvements.monopoly && descriptor.countImprovements
            ) {
              const monopolisticFuncs = from(buildings).where(
                func =>
                  !!func.building
                  && !!func.class
                  && player.monopolies[(func.class as ObjectId).toHexString()]
              ).toArray();
              
              if (this._rules.building.improvements.type === 'level') {
                const monopolyFactor = this._rules.building.fee.monopoly.factor;
                for (let func of monopolisticFuncs) {
                  if (typeof player.improvements[func.id] === 'number') {
                    const level = player.improvements[func.id] as number;
                    feeSum += func.building.improvements[level].fee * percentage;
                  } else {
                    feeSum += func.building.fee * monopolyFactor * percentage;
                  }
                }
              }
            } else {

            }
            player.cash += feeSum;
            

            break;
          
          case 'building.improvements:level':

            break;
        }
      }
    }
  }

  public constructor(rulesProvider: IGameRulesProvider) {
    if (!rulesProvider) {
      throw new Error("rulesProvider is undefined");
    }
    if (!rulesProvider.board.extendedPopulated(['cellFunctions']).cellFunctions) {
      throw new Error('board is not populated with cellFunctions');
    }
    this._rulesProvider = rulesProvider;
    this._rules = this._rulesProvider.board.rules;
    this._cells = this._rulesProvider.board.cells;
    this._timeouts = new GameTimeouts();
  }

  public get eventNames() {
    return Object.keys(this._listeners);
  }

  public getListener(eventName: string, socket: AuthorizedSocket): (...args: Array<any>) => any {
    return listenerWrapper.bind(this, socket, this._listeners[eventName]);
  }

  private getHanler(eventName: string, socket: AuthorizedSocket): (...args: Array<any>) => any {
    return listenerWrapper.bind(this, socket, this._handlers[eventName]);
  }
}

async function listenerWrapper(socket: AuthorizedSocket, listener: SocketEventHanler, ...args: Array<any>) {
  const game = await findGame(socket.data.gameId);
  if (game.status === 'playing') {
    await listener.call(this, game, socket, ...args);
    await game.save();
  }
}