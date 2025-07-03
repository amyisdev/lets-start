import type { ErrorHandler } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export class AppError extends Error {
  public readonly statusCode: ContentfulStatusCode
  public readonly errorCode?: string

  constructor(message: string, statusCode: ContentfulStatusCode, errorCode: string) {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }

    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'You must be logged in to access this resource') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, errorCode: string) {
    super(message, 400, errorCode)
  }
}

export const errorHandler: ErrorHandler = (err, c) => {
  let statusCode: ContentfulStatusCode = 500
  const responseBody: { status: string; message: string; code: string } = {
    status: 'error',
    message: 'An unexpected error occurred. Please try again later.',
    code: 'UNEXPECTED_ERROR',
  }

  if (err instanceof AppError) {
    statusCode = err.statusCode
    responseBody.message = err.message
    if (err.errorCode) {
      responseBody.code = err.errorCode
    }
  } else {
    if (process.env.NODE_ENV === 'production') {
      console.error(`Unhandled Error: ${err.message}`, { error: err, stack: err.stack, path: c.req.path })
    }

    // In development, show the original message
    if (process.env.NODE_ENV === 'development') {
      responseBody.message = err.message
    }
  }

  return c.json(responseBody, statusCode)
}
