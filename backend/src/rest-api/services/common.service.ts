export class ServiceError extends Error {}

export interface IFindManyOptions {
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
export function rethrowError(err: any): never {
  if (!(err instanceof Object)) {
    throw err;
  } else if (err.message == "sort() only takes 1 Argument") {
    throw new ServiceError('Contradiction between sort fields');
  } else if (objectIdRegex.test(err.message)) {
    throw new ServiceError(err.message);
  } else {
    throw err;
  }
}