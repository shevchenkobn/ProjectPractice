"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_service_1 = require("../../services/game.service");
const gameTimeouts_class_1 = require("../services/gameTimeouts.class");
const helpers_service_1 = require("../services/helpers.service");
const bson_1 = require("bson");
const cellFunction_service_1 = require("../../services/cellFunction.service");
const linq_1 = require("linq");
const helpers_service_2 = require("../../services/helpers.service");
class GameEventsManager {
    constructor(rulesProvider) {
        this._listeners = {};
        this._handlers = {
            async turn(game, socket) {
                const player = game.players[game.playerIndex];
                let noMove = false;
                const modifiers = await helpers_service_2.ensureDocumentsArray(player.modifiers, cellFunction_service_1.findCellFunction);
                for (let func of modifiers) {
                    if (func.modifier.action.skip) {
                        player.otherInfo.skipIter++;
                        if (player.otherInfo.skip === player.otherInfo.skipIter) {
                            continue;
                        }
                    }
                    if (func.modifier.break.triggers.includes('turn')) {
                        /** //TODO: ask player what to do
                         * "action": {
                          "or": [
                            {
                              "throw": "eq"
                            },
                            {
                              "cash": -50
                            }
                          ]
                        }
                        */
                    }
                }
                if (noMove) {
                    return; //TODO: send sockets;
                }
                let repeatCount = 0;
                do {
                    const steps = this._rules.dices.map(range => helpers_service_1.getIntegerBetween(range.min, range.max));
                    for (let event of this._rules.events) {
                        const trigger = event.triggers.find(trigger => trigger.startsWith('turn.throw:eq'));
                        if (trigger) {
                            const regexArr = trigger.match(/:(\d+)$/);
                            if (regexArr) {
                                const limit = Number.parseInt(regexArr[1]);
                                if (repeatCount >= limit) {
                                    await this._handlers.applyAction.call(this, game, socket, event.action);
                                    break;
                                }
                            }
                            else {
                                let diceEqual = steps.length > 1;
                                for (let i = 1; i < steps.length; i++) {
                                    if (steps[i - 1] !== steps[i]) {
                                        diceEqual = false;
                                        break;
                                    }
                                }
                                if (diceEqual && event.action.throw === 'repeat') {
                                    repeatCount++;
                                }
                            }
                        }
                    }
                    const totalSteps = steps.reduce((sum, step) => sum + step);
                    await this._handlers.smartMove.call(this, game, socket, totalSteps);
                } while (repeatCount);
            },
            async smartMove(game, socket, totalSteps, reverse = false) {
                /**
                 * cell.next is not used!
                 */
                const player = game.players[game.playerIndex];
                const events = [];
                let lastEventCellId = -1;
                let newCellId = player.cellId + 1;
                for (let i = 0; i < totalSteps; i++) {
                    if (this._cells[newCellId].function) {
                        const cellFunc = this._cells[newCellId].function;
                        if (cellFunc.event) {
                            if (cellFunc.event.triggers.includes('hover')) {
                                events.push(cellFunc);
                                lastEventCellId = newCellId;
                            }
                        }
                    }
                    newCellId = (newCellId + (reverse ? -1 : +1)) % this._cells.length;
                }
                player.cellId = newCellId;
                for (let event of events) {
                    await this._handlers.handleEvent.call(this, game, socket, event);
                }
                if (this._cells[newCellId].function) {
                    const cellFunc = this._cells[newCellId].function;
                    if (cellFunc.event) { // it is needed to handle redirect events correctly
                        if (cellFunc.event.triggers.includes('stop')
                            && newCellId !== lastEventCellId) {
                            await this._handlers.handleEvent.call(this, game, socket, cellFunc);
                        }
                    }
                    else if (cellFunc.building) {
                        const ownerIndex = this._handlers.getOwnerIndex.call(this, game, socket, cellFunc);
                        if (ownerIndex > -1) {
                            const fee = await this._handlers.getBuildingFee.call(this, game, socket, cellFunc, true, ownerIndex);
                            player.cash -= fee;
                        }
                        else {
                            const willBuy = true;
                            //TODO: ask about buying
                            if (willBuy) {
                                if (!(await this._handlers.tryBuyBuilding.call(this, game, socket, cellFunc))) {
                                    //TODO: start auction
                                }
                            }
                        }
                    }
                }
            },
            async handleEvent(game, socket, func) {
                if (!func.event) {
                    return;
                }
                let action;
                if (func.event.options) {
                    const indexes = game.otherInfo.cellEventOptions[func.id];
                    action = func.event.options[indexes[0]];
                    indexes.push(indexes.shift());
                    if (typeof action.useOptionId === 'number') {
                        await this._handlers.applyAction.call(this, game, socket, func.event.options.find(option => option.optionId === action.useOptionId));
                        if (Object.keys(action).length === 2) {
                            return;
                        }
                    }
                }
                else {
                    action = func.event.action;
                }
                await this._handlers.applyAction.call(this, game, socket, action);
            },
            async applyAction(game, socket, action) {
                const player = game.players[game.playerIndex];
                if (action.cash) {
                    player.cash += action.cash;
                }
                if (action.cashDescriptor) {
                    const descriptor = action.cashDescriptor;
                    switch (descriptor.type) {
                        case 'building.fee': {
                            let buildings;
                            if (!descriptor.countMortgaged && this._rules.building.fee.monopoly.mortgageBreaks) {
                                buildings = await helpers_service_2.ensureDocumentsArray(player.buildings.filter(obj => !player.mortgaged.some(obj2 => helpers_service_2.getId(obj) === helpers_service_2.getId(obj2))), cellFunction_service_1.findCellFunction);
                            }
                            // const buildings = (await Promise.all(
                            //   buildingsIds.map(objectId => findCellFunction((objectId as ObjectId).toHexString()))
                            // ));
                            if (descriptor.each) {
                                const percentage = descriptor.each.percentage;
                                if (descriptor.countMonopolistic && descriptor.countImprovements) {
                                    let sum = 0;
                                    for (let building of buildings) {
                                        sum += await this._handlers.getBuildingFee.call(this, game, socket, building, true) * percentage;
                                    }
                                    player.cash += sum;
                                }
                            }
                            break;
                        }
                        case 'building.improvements': {
                            const improved = Object.keys(player.improvements);
                            const buildings = await helpers_service_2.ensureDocumentsArray(player.buildings.filter(obj => improved.includes(helpers_service_2.getId(obj))), cellFunction_service_1.findCellFunction);
                            let sum = 0;
                            if (descriptor.each) {
                                const each = descriptor.each;
                                if (this._rules.building.improvements.type === 'level') {
                                    for (let func of buildings) {
                                        const level = player.improvements[func.id];
                                        if (typeof each.max === 'number'
                                            && level === func.building.improvements.length - 1) {
                                            sum += each.max;
                                        }
                                        else if (typeof each.any === 'number') {
                                            sum += each.any;
                                        }
                                        else {
                                            sum += each[level];
                                        }
                                    }
                                }
                            }
                            break;
                        }
                    }
                }
                if (action.goto) {
                    const goto = action.goto.find(gotoOption => helpers_service_2.getId(gotoOption.board) === this._rulesProvider.board.id);
                    if (!goto) {
                        throw new Error('Board Id is not found');
                    }
                    await this._handlers.smartMove.call(this, game, socket, (goto.cellId + this._cells.length - player.cellId) % this._cells.length, goto.reverse);
                    const func = this._cells[player.cellId].function;
                    if (func.event) {
                        if (func.event.triggers.includes('redirect')) {
                            await this._handlers.handleEvent.call(this, game, socket, func);
                        }
                    }
                }
                if (action.otherPlayers) {
                    for (let act of action.otherPlayers) {
                        for (let otherPlayer of game.players) {
                            if (typeof act.cash === 'number') {
                                otherPlayer.cash += act.cash;
                                if (act.to === 'player') {
                                    player.cash += -act.cash;
                                }
                            }
                        }
                    }
                }
                if (Array.isArray(action.or)) {
                    //TODO: init dialog for player and applyAction for chosen
                    // this._handlers.applyAction.call(this, game, socket, action.or[i]);
                }
                if (action.event) {
                    const event = action.goto.find(gotoOption => helpers_service_2.getId(gotoOption.board) === this._rulesProvider.board.id);
                    await this._handlers.handleEvent.call(this, game, socket, event.event instanceof bson_1.ObjectId
                        ? await cellFunction_service_1.findCellFunction(event.event.toHexString()) : event.event);
                }
                if (action.apply) {
                    this._handlers.applyModifier.call(this, game, socket, await cellFunction_service_1.findCellFunction(action.apply));
                }
                if (typeof action.fortune === 'number') {
                    const delta = player.cash * action.fortune;
                    player.cash += delta;
                }
                if (action.skip) {
                    player.otherInfo.skip = 3;
                    player.otherInfo.skipIter = 0;
                }
                if (action.save) {
                    player.inventory.push(action.save);
                }
                if (action.move) {
                    await this._handlers.smartMove.call(this, game, socket, action.move, true);
                }
            },
            async getBuildingFee(game, socket, func, trusted = false, playerIndex = game.playerIndex) {
                const player = game.players[playerIndex];
                if (!trusted && (!func.building || !player.buildings.some(funcOrId => {
                    return func.id === helpers_service_2.getId(funcOrId);
                }))) {
                    throw new Error('Invalid building object');
                }
                const isMortgaged = player.mortgaged.some(funcOrId => {
                    return func.id === helpers_service_2.getId(funcOrId);
                });
                if (!this._rules.building.fee.fromMortgaged && isMortgaged) {
                    return 0;
                }
                if (typeof func.building.fee === 'number') {
                    const monopolistic = player.monopolies[helpers_service_2.getId(func.class)];
                    if (func.id in player.improvements) {
                        if (this._rules.building.improvements.monopoly && !monopolistic) {
                            return func.building.fee;
                        }
                        switch (this._rules.building.improvements.type) {
                            case ('level'): {
                                const level = player.improvements[func.id];
                                return func.building.improvements[level].fee;
                            }
                        }
                    }
                    else if (monopolistic) {
                        return func.building.fee * this._rules.building.fee.monopoly.factor;
                    }
                    return func.building.fee;
                }
                else {
                    if (!func.populated('class')) { // FIXME: maybe just get by id
                        await func.populate('class').execPopulate();
                    }
                    const cl = func.class;
                    if (cl.descriptor.feeDescriptor) {
                        const feeDescriptor = cl.descriptor.feeDescriptor;
                        if (feeDescriptor.type.startsWith('quantitive')) {
                            const hasCount = cl.functions.filter(obj => player.buildings.some(obj2 => helpers_service_2.getId(obj) === helpers_service_2.getId(obj2))).length;
                            switch (feeDescriptor.type) {
                                case 'quantitive:values': { // FIXME: if performance will suck it can be added to monopoly, improvements or otherinfo
                                    return feeDescriptor.values[hasCount];
                                }
                                case 'quantitive:throw': {
                                    if (feeDescriptor.throw === 'all') {
                                        const points = this._rules.dices.map(// TODO: pass thrown dices points
                                        // TODO: pass thrown dices points
                                        dice => helpers_service_1.getIntegerBetween(dice.min, dice.max));
                                        return linq_1.from(points).sum(dicePoints => dicePoints * feeDescriptor.factors[hasCount]);
                                    }
                                    else {
                                        return 0;
                                    }
                                }
                            }
                        }
                    }
                }
                return 0;
            },
            async applyModifier(game, socket, func) {
                if (!func.modifier) {
                    throw new Error('cellFuntion is not a modifier');
                }
                const player = game.players[game.playerIndex];
                player.modifiers.push(func);
                await this._handlers.applyAction.call(this, game, socket, func.modifier.action);
            },
            async getOwnerIndex(game, socket, func) {
                for (let i = 0; i < game.players.length; i++) {
                    const found = game.players[i].buildings.find(obj => helpers_service_2.getId(obj) === func.id);
                    if (found) {
                        return i;
                    }
                }
                return -1;
            },
            async tryBuyBuilding(game, socket, func) {
                if (!func.building) {
                    throw new Error('func is not a building');
                }
                const player = game.players[game.playerIndex];
                if (func.building.price > player.cash) {
                    return false;
                }
                //TODO: add func, updated assets, check monopoly
                return true;
            }
        };
        if (!rulesProvider) {
            throw new Error("rulesProvider is undefined");
        }
        if (!rulesProvider.board.extendedPopulated(['cellFunctions']).cellFunctions) {
            throw new Error('board is not populated with cellFunctions');
        }
        this._rulesProvider = rulesProvider;
        this._rules = this._rulesProvider.board.rules;
        this._cells = this._rulesProvider.board.cells;
        this._timeouts = new gameTimeouts_class_1.GameTimeouts();
    }
    get eventNames() {
        return Object.keys(this._listeners);
    }
    getListener(eventName, socket) {
        return listenerWrapper.bind(this, socket, this._listeners[eventName]);
    }
    getHanler(eventName, socket) {
        return listenerWrapper.bind(this, socket, this._handlers[eventName]);
    }
}
exports.GameEventsManager = GameEventsManager;
async function listenerWrapper(socket, listener, ...args) {
    const game = await game_service_1.findGame(socket.data.gameId);
    if (game.status === 'playing') {
        await listener.call(this, game, socket, ...args);
        await game.save();
    }
}
//# sourceMappingURL=gameEventsManager.class.js.map