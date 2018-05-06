import { initialize as boardServiceInitialize } from './board.service';
import { initialize as gameServiceInitialize } from './game.service';
import { initialize as cellFunctionServiceInitialize } from './cellFunction.service';
import { initialize as cellFunctionClassServiceInitialize } from './cellFunctionClass.service';

export function initialize() {
  boardServiceInitialize();
  gameServiceInitialize();
  cellFunctionServiceInitialize();
  cellFunctionClassServiceInitialize();
}