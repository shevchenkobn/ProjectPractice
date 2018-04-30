import { ErrorRequestHandler, RequestHandler } from "express-serve-static-core";
import { HttpError, BadRequest, InternalServerError, Forbidden } from 'http-errors';

export class ClientRequestError extends Error {}
export class AccessError extends Error {}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof ClientRequestError) {
    err = new BadRequest(err.message);
  } else if (err instanceof AccessError) {
    err = new Forbidden(err.message);
  } else {
    err = new InternalServerError(err.message);
  }
  res.status(err.status).json(err);
}

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({message: "Not Found"});
};