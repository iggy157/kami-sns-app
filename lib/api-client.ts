import { AppError, ErrorCodes, withRetry } from "./error-handler"

interface ApiResponse<T = any> {
  data?: T
  error?: string
  success?: boolean
}

interface RequestOptions {
  method?: string
  headers?: Record<string, string>
  body?: any
  retries?: number
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  private getAuthHeader(): Record<string, string> {
    if (typeof window !== "undefined") {
      const token = this.getStoredToken()
      return token ? { Authorization: `Bearer ${token}` } : {}
    }
    return {}
  }

  private getStoredToken(): string | null {
    if (typeof window !== "undefined") {
      try {
        const authStorage = localStorage.getItem("auth-storage")
        if (authStorage) {
          const parsed = JSON.parse(authStorage)
          return parsed.state?.token || null
        }
      } catch (error) {
        console.error("Failed to get stored token:", error)
      }
    }
    return null
  }

  private async handleResponse(response: Response): Promise<any> {
    // Handle authentication errors
    if (response.status === 401) {
      console.warn("Authentication failed - clearing stored auth data")

      // Clear stored authentication data
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-storage")
      }

      throw new AppError("認証に失敗しました。再ログインしてください。", ErrorCodes.UNAUTHORIZED, 401)
    }

    // Handle other HTTP errors
    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = "リクエストの処理中にエラーが発生しました"
      let errorCode = ErrorCodes.UNKNOWN_ERROR

      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorMessage
        errorCode = this.mapHttpStatusToErrorCode(response.status)

        // Include additional details if available
        if (errorData.details) {
          console.error("API Error Details:", errorData.details)
        }
      } catch {
        errorMessage = response.statusText || errorMessage
        errorCode = this.mapHttpStatusToErrorCode(response.status)
      }

      throw new AppError(errorMessage, errorCode, response.status)
    }

    // Handle successful responses
    const responseText = await response.text()

    if (!responseText) {
      return { success: true }
    }

    try {
      return JSON.parse(responseText)
    } catch (error) {
      console.error("Failed to parse response JSON:", error)
      throw new AppError("サーバーからの応答が無効です", ErrorCodes.UNKNOWN_ERROR, response.status)
    }
  }

  private mapHttpStatusToErrorCode(status: number): string {
    switch (status) {
      case 400:
        return ErrorCodes.VALIDATION_ERROR
      case 401:
        return ErrorCodes.UNAUTHORIZED
      case 403:
        return ErrorCodes.UNAUTHORIZED
      case 404:
        return ErrorCodes.NOT_FOUND
      case 408:
        return ErrorCodes.TIMEOUT
      case 429:
        return ErrorCodes.RATE_LIMIT_EXCEEDED
      case 500:
      case 502:
      case 503:
      case 504:
        return ErrorCodes.DATABASE_ERROR
      default:
        return ErrorCodes.UNKNOWN_ERROR
    }
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const { method = "GET", headers = {}, body, retries = 0 } = options

    // Get authentication headers
    const authHeaders = this.getAuthHeader()

    const requestHeaders = {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    }

    // Add body for non-GET requests
    if (body && method !== "GET") {
      if (method === "POST" && endpoint.includes("/gods/create")) {
        // For god creation, include token in body as fallback
        const token = this.getStoredToken()
        requestOptions.body = JSON.stringify({
          ...body,
          ...(token && !authHeaders.Authorization ? { token } : {}),
        })
      } else {
        requestOptions.body = JSON.stringify(body)
      }
    }

    const makeRequest = async (): Promise<T> => {
      try {
        console.log(`Making ${method} request to ${url}`, {
          hasAuth: !!authHeaders.Authorization,
          headers: Object.keys(requestHeaders),
        })

        const response = await fetch(url, requestOptions)
        return await this.handleResponse(response)
      } catch (error) {
        if (error instanceof AppError) {
          throw error
        }

        if (error instanceof Error) {
          if (error.name === "TypeError" && error.message.includes("fetch")) {
            throw new AppError("ネットワークエラーが発生しました", ErrorCodes.NETWORK_ERROR)
          }
          throw new AppError(error.message, ErrorCodes.UNKNOWN_ERROR)
        }

        throw new AppError("ネットワークエラーが発生しました", ErrorCodes.NETWORK_ERROR)
      }
    }

    // Use retry logic for GET requests and certain error conditions
    if (retries > 0 && (method === "GET" || method === undefined)) {
      return withRetry(() => makeRequest(), retries, 1000, `API ${method} ${endpoint}`)
    }

    return makeRequest()
  }

  // Convenience methods
  async get<T = any>(endpoint: string, headers?: Record<string, string>, retries = 2): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", headers, retries })
  }

  async post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body, headers })
  }

  async put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body, headers })
  }

  async delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", headers })
  }
}

// Create a singleton instance
export const apiClient = new ApiClient()

// Export the class for testing purposes
export { ApiClient }
