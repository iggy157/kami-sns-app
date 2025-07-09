export class AppError extends Error {
  code: string
  status: number

  constructor(message: string, code: string, status = 500) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.status = status
  }
}

export const ErrorCodes = {
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  TIMEOUT: "TIMEOUT",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  DATABASE_ERROR: "DATABASE_ERROR",
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number,
  delay: number,
  operationName = "Operation",
): Promise<T> {
  let attempt = 0
  while (attempt < retries) {
    try {
      return await fn()
    } catch (error) {
      attempt++
      console.warn(`${operationName} failed, retrying (${attempt}/${retries})...`, error)
      if (attempt === retries) {
        console.error(`${operationName} failed after ${retries} attempts.`, error)
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error("Retry failed") // Should not happen, but keeps the compiler happy
}
