import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode: number = 200): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  res.status(statusCode).json(response);
};

export const sendError = (res: Response, error: string, statusCode: number = 400): void => {
  const response: ApiResponse<never> = {
    success: false,
    error,
  };

  res.status(statusCode).json(response);
};
