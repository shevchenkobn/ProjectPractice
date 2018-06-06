"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const board_service_1 = require("../../services/board.service");
const gameEventsManager_class_1 = require("./gameEventsManager.class");
const helpers_service_1 = require("../services/helpers.service");
const helpers_service_2 = require("../../services/helpers.service");
class GameLoopController {
    static get initialized() {
        return !!this._namespace;
    }
    static initialize(namespace) {
        if (this._namespace) {
            throw new Error('Type is initialized');
        }
        helpers_service_1.initialize();
        if (!namespace) {
            throw new Error('namespace is undefined');
        }
        this._namespace = namespace;
    }
    static async getInstance(boardId) {
        if (!this._namespace) {
            throw new Error('Call initialize with namespace first!');
        }
        if (!this._instances[boardId]) {
            this._instances[boardId] = new GameLoopController(await board_service_1.findBoard(boardId));
            await this._instances[boardId].initialize();
        }
        return this._instances[boardId];
    }
    constructor(board) {
        if (!board) {
            throw new Error('Board is undefined');
        }
        this._board = board;
        this._initialized = false;
        this._eventsManager = new gameEventsManager_class_1.GameEventsManager(this);
        this.parseBoard();
    }
    get board() {
        return this._board;
    }
    async initiateGame(game) {
        if (!this._initialized) {
            throw new Error('Instance is not initialized!');
        }
        if (!game) {
            throw new Error('Game is undefined');
        }
        const clients = await helpers_service_1.getClientIds(GameLoopController._namespace, game.id);
        clients.forEach((id, i, arr) => {
            arr[i] = GameLoopController._namespace.connected[id];
        });
        await this.initializeGame(game, clients);
    }
    async tryWinGame(game) {
        if (!this._initialized) {
            throw new Error('Instance is not initialized!');
        }
        const activePlayersIndexes = game.players.reduce((indexesArray, player, index) => {
            if (player.status === 'active') {
                indexesArray.push(index);
            }
            return indexesArray;
        }, []);
        if (activePlayersIndexes.length === 1) {
            const winnerIndex = activePlayersIndexes[0];
            game.winner = game.players[winnerIndex].user;
            game.status = 'finished';
            await game.save();
            const socketIds = await helpers_service_1.getClientIds(GameLoopController._namespace, game.id);
            for (let socketId of socketIds) {
                const socket = GameLoopController._namespace.connected[socketId];
                if (socket.data.sessionId === helpers_service_2.getId(game.players[winnerIndex].session)) {
                    socket.emit('winner'); // TODO: use from event handles
                    helpers_service_1.disconnectSocket(socket, {
                        message: 'Game is finished. You are the winner.'
                    });
                }
            }
            return true;
        }
        else {
            return false;
        }
    }
    async initialize() {
        const paths = ['cellFunctions'];
        if (!this._board.extendedPopulated(paths).cellFunctions) {
            await this._board.extendedPopulate(paths);
        }
        this._initialized = true;
    }
    parseBoard() {
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
    async initializeGame(game, sockets) {
        await this.prepareGame(game);
        this.addListeners(game, sockets);
        this.startGame(game.id);
    }
    async prepareGame(game) {
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
            const eventCellsWithOptions = this._board.cells.filter(cell => 'event' in cell.function
                && 'options' in cell.function.event);
            if (eventCellsWithOptions.length) {
                const events = {};
                game.otherInfo.cellEventOptions = events;
                for (let cell of eventCellsWithOptions) {
                    const event = cell.function;
                    if (!events[event.id]) {
                        events[event.id] = helpers_service_1.getRange(event.event.options.length, true);
                    }
                }
            }
        }
        // FIXME: probably board events should also go to otherInfo
        await game.save();
    }
    addListeners(game, sockets) {
        for (let eventName of this._eventsManager.eventNames) {
            for (let socket of sockets) {
                socket.on(eventName, this._eventsManager.getListener(eventName, socket));
            }
        }
    }
    startGame(roomId) {
        // TODO: add documentation
        GameLoopController._namespace.to(roomId).emit('start');
    }
}
exports.GameLoopController = GameLoopController;
//# sourceMappingURL=gameLoop.class.js.map