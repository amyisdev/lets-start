import { beforeEach, describe, expect, it, jest } from 'bun:test'
import { AppError, BadRequestError, errorHandler, NotFoundError, UnauthorizedError } from '@/shared/app-error'

describe('Error Handler', () => {
  const mockResponse = jest.fn()
  const mockContext = {
    json: mockResponse,
    req: { path: '/test' },
    // biome-ignore lint/suspicious/noExplicitAny: mock context
  } as any

  beforeEach(() => mockResponse.mockClear())

  it('should return json response when given custom error', () => {
    const error = new AppError('Custom Error', 400, 'CUSTOM_ERROR')

    errorHandler(error, mockContext)

    expect(mockResponse).toHaveBeenCalledWith(
      {
        status: 'error',
        message: 'Custom Error',
        code: 'CUSTOM_ERROR',
      },
      400,
    )
  })

  it('should handle non-AppError with default message in production', () => {
    const error = new Error('Some error')

    errorHandler(error, mockContext)

    expect(mockResponse).toHaveBeenCalledWith(
      {
        status: 'error',
        message: 'An unexpected error occurred. Please try again later.',
        code: 'UNEXPECTED_ERROR',
      },
      500,
    )
  })

  it('should show original error message in development mode', () => {
    process.env.NODE_ENV = 'development'
    const error = new Error('Some error')

    errorHandler(error, mockContext)

    expect(mockResponse).toHaveBeenCalledWith(
      {
        status: 'error',
        message: 'Some error',
        code: 'UNEXPECTED_ERROR',
      },
      500,
    )

    process.env.NODE_ENV = 'test'
  })

  it('should handle NotFoundError correctly', () => {
    const error = new NotFoundError()

    errorHandler(error, mockContext)

    expect(mockResponse).toHaveBeenCalledWith(
      {
        status: 'error',
        message: 'Not found',
        code: 'NOT_FOUND',
      },
      404,
    )
  })

  it('should handle UnauthorizedError correctly', () => {
    const error = new UnauthorizedError()

    errorHandler(error, mockContext)

    expect(mockResponse).toHaveBeenCalledWith(
      {
        status: 'error',
        message: 'You must be logged in to access this resource',
        code: 'UNAUTHORIZED',
      },
      401,
    )
  })

  it('should handle BadRequestError correctly', () => {
    const error = new BadRequestError('Invalid input', 'INVALID_INPUT')

    errorHandler(error, mockContext)

    expect(mockResponse).toHaveBeenCalledWith(
      {
        status: 'error',
        message: 'Invalid input',
        code: 'INVALID_INPUT',
      },
      400,
    )
  })
})
