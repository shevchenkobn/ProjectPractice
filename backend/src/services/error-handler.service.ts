import { ErrorRequestHandler, RequestHandler, Request } from "express-serve-static-core";
import { HttpError, BadRequest, InternalServerError, Forbidden, NotFound } from 'http-errors';
import httpErrors from 'http-errors';

export class ClientRequestError extends Error {}
export class AccessError extends Error {}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const codeBySwagger = getCodeFromSwaggerError(err, req);
  if (codeBySwagger) {
    err.status = codeBySwagger;
    Object.defineProperties(err, {
      status: {
        enumerable: false,
      },
      message: {
        enumerable: true,
      }
    });
  } else if (err instanceof ClientRequestError) {
    err = new BadRequest(err.message);
  } else if (err instanceof AccessError) {
    err = new Forbidden(err.message);
  } else {
    err = new InternalServerError(err.message);
  }
  res.status(err.status).json(err);
}

export const notFoundHandler: RequestHandler = (req, res) => {
  const err = new NotFound();
  res.status(err.status).json(err);
};

// 0 is returned if not swagger error
const swaggerErrorRegex = /.*swagger.*/i;
function getCodeFromSwaggerError(err: any, req: Request): number {
  if (err.failedValidation) {
    return 400;
  } else if (swaggerErrorRegex.test(err.message)) {
    if (
      Array.isArray(err.allowedMethods)
      && (err.allowedMethods as Array<any>).every(item => item != req.method)
    ) {
      return 404;
    }
  } else {
    return 0;
  }
}