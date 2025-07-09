// Mock authentication for demo purposes
export interface MockUser {
  id: string
  username: string
  email: string
  profileImage?: string
  bio?: string
  isAdmin: boolean
  isSuperAdmin: boolean
  saisenBalance: number
  createdAt: string
}

// In-memory storage for demo (in production, this would be a database)
const mockUsers: MockUser[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@kami.app",
    isAdmin: true,
    isSuperAdmin: true,
    saisenBalance: 10000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "user1",
    email: "user1@kami.app",
    isAdmin: false,
    isSuperAdmin: false,
    saisenBalance: 1000,
    createdAt: new Date().toISOString(),
  },
]

// Store registered users with their actual passwords
const userPasswords: Record<string, string> = {
  "admin@kami.app": "admin123",
  "user1@kami.app": "user123",
}

// Store created gods - using localStorage for persistence
const GODS_STORAGE_KEY = "mock_gods_data"
const MESSAGES_STORAGE_KEY = "mock_messages_data"

// Store active tokens with user mapping - グローバルに管理
const activeTokens: Record<string, string> = {}

// Helper functions for localStorage
const getStoredGods = (): any[] => {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(GODS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const setStoredGods = (gods: any[]) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(GODS_STORAGE_KEY, JSON.stringify(gods))
  } catch (error) {
    console.error("Failed to store gods:", error)
  }
}

const getStoredMessages = (): any[] => {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const setStoredMessages = (messages: any[]) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages))
  } catch (error) {
    console.error("Failed to store messages:", error)
  }
}

export const mockLogin = async (email: string, password: string): Promise<{ user: MockUser; token: string } | null> => {
  console.log("Mock login attempt:", { email, password, userCount: mockUsers.length })

  // Find user by email
  const user = mockUsers.find((u) => u.email === email)
  if (!user) {
    console.log("User not found for email:", email)
    return null
  }

  // Check password
  const storedPassword = userPasswords[email]
  if (!storedPassword || storedPassword !== password) {
    console.log("Password mismatch:", { provided: password, stored: storedPassword })
    return null
  }

  console.log("Login successful for:", email)
  const token = `mock-token-${user.id}-${Date.now()}`

  // Store token mapping
  activeTokens[token] = user.id
  console.log("Token created and stored:", {
    token: token.substring(0, 30) + "...",
    userId: user.id,
    totalActiveTokens: Object.keys(activeTokens).length,
  })

  return { user, token }
}

export const mockRegister = async (username: string, email: string, password: string): Promise<MockUser | null> => {
  console.log("Mock register attempt:", { username, email, currentUsers: mockUsers.length })

  // Check if user already exists
  const existingUser = mockUsers.find((u) => u.email === email || u.username === username)
  if (existingUser) {
    console.log("User already exists:", existingUser.email)
    return null
  }

  const newUser: MockUser = {
    id: (mockUsers.length + 1).toString(),
    username,
    email,
    isAdmin: false,
    isSuperAdmin: false,
    saisenBalance: 1000,
    createdAt: new Date().toISOString(),
  }

  mockUsers.push(newUser)
  userPasswords[email] = password

  console.log("New user created:", newUser)
  return newUser
}

export const mockGetUserFromToken = async (token: string): Promise<MockUser | null> => {
  console.log("Getting user from token:", {
    token: token.substring(0, 30) + "...",
    activeTokensCount: Object.keys(activeTokens).length,
  })

  // Check if token exists in active tokens
  const userId = activeTokens[token]
  if (userId) {
    const user = mockUsers.find((u) => u.id === userId)
    console.log("User found from active tokens:", { userId, found: !!user })
    return user || null
  }

  // If not found in active tokens, try to parse mock token format
  if (token.startsWith("mock-token-")) {
    const parts = token.split("-")
    if (parts.length >= 3) {
      const userId = parts[2]
      console.log("Parsing mock token:", { userId })
      const user = mockUsers.find((u) => u.id === userId)
      if (user) {
        // Add to active tokens for session management
        activeTokens[token] = user.id
        console.log("Token added to active tokens")
        return user
      }
    }
  }

  console.log("Token validation failed")
  return null
}

export const forceAddToken = (token: string, userId: string) => {
  activeTokens[token] = userId
}

export const getActiveTokens = () => activeTokens

export const getAllMockUsers = () => mockUsers

export const mockUpdateUserBalance = async (userId: string, newBalance: number): Promise<boolean> => {
  const userIndex = mockUsers.findIndex((u) => u.id === userId)
  if (userIndex === -1) {
    console.log("User not found for balance update:", userId)
    return false
  }

  const oldBalance = mockUsers[userIndex].saisenBalance
  mockUsers[userIndex].saisenBalance = newBalance
  console.log("Updated user balance:", { userId, oldBalance, newBalance })
  return true
}

export const mockCreateGod = async (godData: any): Promise<string> => {
  const godId = `god_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const god = {
    id: godId,
    ...godData,
    createdAt: new Date().toISOString(),
    believersCount: 0,
    powerLevel: 1,
  }

  // Store in localStorage
  const existingGods = getStoredGods()
  existingGods.push(god)
  setStoredGods(existingGods)

  console.log("God created:", { godId, totalGods: existingGods.length })
  return godId
}

export const mockGetGodById = async (godId: string): Promise<any | null> => {
  const gods = getStoredGods()
  const god = gods.find((g) => g.id === godId)
  return god || null
}

export const mockGetUserGods = async (userId: string): Promise<any[]> => {
  const gods = getStoredGods()
  return gods.filter((g) => g.creatorId === userId)
}

export const mockSaveMessage = async (messageData: any): Promise<string> => {
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const message = {
    id: messageId,
    ...messageData,
    createdAt: new Date().toISOString(),
  }

  const existingMessages = getStoredMessages()
  existingMessages.push(message)
  setStoredMessages(existingMessages)

  console.log("Message saved:", { messageId, totalMessages: existingMessages.length })
  return messageId
}

export const mockGetUserMessages = async (userId: string): Promise<any[]> => {
  const messages = getStoredMessages()
  return messages
    .filter((m) => m.userId === userId && m.response)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
}

export const mockGetGodMessages = async (userId: string, godId: string): Promise<any[]> => {
  const messages = getStoredMessages()
  return messages
    .filter((m) => m.userId === userId && m.godId === godId && m.response)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

// 新しい関数: コミュニティメッセージ取得
export const mockGetCommunityMessages = async (godId: string): Promise<any[]> => {
  const messages = getStoredMessages()
  return messages
    .filter((m) => m.godId === godId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export const getAllMockGods = (): any[] => {
  return getStoredGods()
}
