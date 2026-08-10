/**
 * Typed application error classes.
 * Each error carries an HTTP status code and a machine-readable code
 * for consistent API error responses.
 */

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational = true

  constructor(message: string, statusCode: number, code: string) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    Error.captureStackTrace(this, this.constructor)
  }
}

// ─── 400 Bad Request ──────────────────────────────────────────────────────────

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

// ─── 404 Not Found ────────────────────────────────────────────────────────────

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

// ─── 409 Conflict ─────────────────────────────────────────────────────────────

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

// ─── 410 Gone ─────────────────────────────────────────────────────────────────

export class GoneError extends AppError {
  constructor(message: string) {
    super(message, 410, 'GONE')
    this.name = 'GoneError'
  }
}

// ─── 422 Unprocessable ────────────────────────────────────────────────────────

export class UnprocessableError extends AppError {
  constructor(message: string) {
    super(message, 422, 'UNPROCESSABLE')
    this.name = 'UnprocessableError'
  }
}

// ─── 503 Service Unavailable ──────────────────────────────────────────────────

export class ServiceUnavailableError extends AppError {
  constructor(message: string) {
    super(message, 503, 'SERVICE_UNAVAILABLE')
    this.name = 'ServiceUnavailableError'
  }
}
