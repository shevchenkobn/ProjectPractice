import { ServiceError } from "./common.service";

export function prepareFilter(filterString: string): any {
  try {
    return JSON.parse(filterString, (key, value) => {
      if ((value instanceof Object) && !Array.isArray(value)) {
        const keys = Object.keys(value);
        if (keys.length === 1 && keys[0] === '$date') {
          return new Date(value.$date);
        }
      }
      return value;
    });
  } catch (err) {
    throw new ServiceError('Invalid filter string');
  }
}