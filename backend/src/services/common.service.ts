export class ServiceError extends Error {}

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
  if (!(err instanceof Error)) {
    throw err;
  } else if (err.message == "sort() only takes 1 Argument") {
    throw new ServiceError('Contradiction between sort fields');
  } else if (
    objectIdRegex.test(err.message)
    || unknownOperatorRegex.test(err.message)
    || cantUseOperatorRegex.test(err.message)
  ) {
    throw new ServiceError(err.message);
  } else {
    throw err;
  }
}