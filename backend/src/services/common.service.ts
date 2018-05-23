import { Error as MongooseError, CastError, ValidationError } from 'mongoose';

export class ServiceError extends Error { }

class MongooseServiceError extends ServiceError {
  [mongooseErrorProps: string]: any;

  constructor(errObj: MongooseError, message?: string) {
    super();

    const errPropsDict = errObj as { [prop: string]: any };
    for (const prop of Object.keys(errObj)) {
      this[prop] = errPropsDict[prop];
    }

    if (message) {
      this.message = message;
    }
  }
}

export interface IFindManyOptions {
  filter?: any,
  offset?: number,
  limit?: number,
  sort?: Array<string>,
  lean?: boolean
}

export function prepareFilter(filterString: string): any {
  try {
    return JSON.parse(filterString);
  } catch (err) {
    throw new ServiceError('Invalid filter string');
  }
}

const objectIdRegex = /objectid/i;
const unknownOperatorRegex = /unknown operator/i;
const cantUseOperatorRegex = /Can't use \$/i;
export function rethrowError(err: any): never {
  console.log(err.constructor);
  if (!(err instanceof Error)) {
    throw err;
  } else if (err.message == "sort() only takes 1 Argument") {
    throw new MongooseServiceError(err, 'Contradiction between sort fields');
  } else if (
    err instanceof MongooseError
    || objectIdRegex.test(err.message)
    || unknownOperatorRegex.test(err.message)
    || cantUseOperatorRegex.test(err.message)
  ) {
    throw new MongooseServiceError(err);
  } else {
    throw err;
  }
}