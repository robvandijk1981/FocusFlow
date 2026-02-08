import { Response } from 'express';

export function successResponse(res: Response, data: any, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

export function createdResponse(res: Response, data: any) {
  return successResponse(res, data, 201);
}

export function noContentResponse(res: Response) {
  return res.status(204).send();
}

export function errorResponse(res: Response, message: string, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
}
