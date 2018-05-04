export class ServiceError extends Error {}

export function rethrowError(err: any): never {
  if (err.message == "sort() only takes 1 Argument") {
    throw new ServiceError('Contradiction between sort fields');
  } else {
    throw err;
  }
}