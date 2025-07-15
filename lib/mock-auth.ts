import { promises as fs } from 'fs'
import path from 'path'

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

// Default users - will be merged with stored users
const defaultUsers: MockUser[] = [
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

// Default passwords - will be merged with stored passwords
const defaultPasswords: Record<string, string> = {
  "admin@kami.app": "admin123",
  "user1@kami.app": "user123",
}

// Storage keys and file paths
const GODS_STORAGE_KEY = "mock_gods_data"
const MESSAGES_STORAGE_KEY = "mock_messages_data"
const ACTIVE_TOKENS_KEY = "mock_active_tokens"
const USERS_STORAGE_KEY = "mock_users_data"
const PASSWORDS_STORAGE_KEY = "mock_passwords_data"

// File paths for server-side storage
const dataDir = path.join(process.cwd(), 'data')
const usersFilePath = path.join(dataDir, 'users.json')
const passwordsFilePath = path.join(dataDir, 'passwords.json')
const tokensFilePath = path.join(dataDir, 'tokens.json')
const godsFilePath = path.join(dataDir, 'gods.json')
const messagesFilePath = path.join(dataDir, 'messages.json')

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (error) {
    // Directory already exists
  }
}

// Server-side file operations
const readServerFile = async (filePath: string): Promise<any> => {
  try {
    await ensureDataDir()
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return null
  }
}

const writeServerFile = async (filePath: string, data: any): Promise<void> => {
  try {
    await ensureDataDir()
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Failed to write file ${filePath}:`, error)
  }
}

// Helper functions for users persistence
const getStoredUsers = async (): Promise<MockUser[]> => {
  if (typeof window === "undefined") {
    // Server-side: use file system
    const storedUsers = await readServerFile(usersFilePath)
    if (storedUsers && Array.isArray(storedUsers)) {
      // Merge default users with stored users (avoid duplicates by email)
      const allUsers = [...defaultUsers]
      storedUsers.forEach((storedUser: MockUser) => {
        if (!allUsers.find(u => u.email === storedUser.email)) {
          allUsers.push(storedUser)
        }
      })
      return allUsers
    }
    return defaultUsers
  } else {
    // Client-side: use localStorage
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY)
      if (stored) {
        const storedUsers = JSON.parse(stored)
        const allUsers = [...defaultUsers]
        storedUsers.forEach((storedUser: MockUser) => {
          if (!allUsers.find(u => u.email === storedUser.email)) {
            allUsers.push(storedUser)
          }
        })
        return allUsers
      }
      return defaultUsers
    } catch {
      return defaultUsers
    }
  }
}

const setStoredUsers = async (users: MockUser[]): Promise<void> => {
  // Only store users that are not in the default list
  const customUsers = users.filter(user => 
    !defaultUsers.find(defaultUser => defaultUser.email === user.email)
  )

  if (typeof window === "undefined") {
    // Server-side: use file system
    await writeServerFile(usersFilePath, customUsers)
  } else {
    // Client-side: use localStorage
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(customUsers))
    } catch (error) {
      console.error("Failed to store users:", error)
    }
  }
}

const getStoredPasswords = async (): Promise<Record<string, string>> => {
  if (typeof window === "undefined") {
    // Server-side: use file system
    const storedPasswords = await readServerFile(passwordsFilePath)
    if (storedPasswords && typeof storedPasswords === 'object') {
      return { ...defaultPasswords, ...storedPasswords }
    }
    return defaultPasswords
  } else {
    // Client-side: use localStorage
    try {
      const stored = localStorage.getItem(PASSWORDS_STORAGE_KEY)
      if (stored) {
        const storedPasswords = JSON.parse(stored)
        return { ...defaultPasswords, ...storedPasswords }
      }
      return defaultPasswords
    } catch {
      return defaultPasswords
    }
  }
}

const setStoredPasswords = async (passwords: Record<string, string>): Promise<void> => {
  // Only store passwords that are not in the default list
  const customPasswords: Record<string, string> = {}
  Object.entries(passwords).forEach(([email, password]) => {
    if (!defaultPasswords[email]) {
      customPasswords[email] = password
    }
  })

  if (typeof window === "undefined") {
    // Server-side: use file system
    await writeServerFile(passwordsFilePath, customPasswords)
  } else {
    // Client-side: use localStorage
    try {
      localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(customPasswords))
    } catch (error) {
      console.error("Failed to store passwords:", error)
    }
  }
}

// Helper functions for active tokens persistence
const getActiveTokens = async (): Promise<Record<string, string>> => {
  if (typeof window === "undefined") {
    // Server-side: use file system
    const storedTokens = await readServerFile(tokensFilePath)
    return storedTokens || {}
  } else {
    // Client-side: use localStorage
    try {
      const stored = localStorage.getItem(ACTIVE_TOKENS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }
}

const setActiveTokens = async (tokens: Record<string, string>): Promise<void> => {
  if (typeof window === "undefined") {
    // Server-side: use file system
    await writeServerFile(tokensFilePath, tokens)
  } else {
    // Client-side: use localStorage
    try {
      localStorage.setItem(ACTIVE_TOKENS_KEY, JSON.stringify(tokens))
    } catch (error) {
      console.error("Failed to store active tokens:", error)
    }
  }
}

// Helper functions for gods storage (both client and server)
const getStoredGods = async (): Promise<any[]> => {
  if (typeof window === "undefined") {
    // Server-side: read from file
    const fileData = await readServerFile(godsFilePath)
    return fileData || []
  } else {
    // Client-side: read from localStorage
    try {
      const stored = localStorage.getItem(GODS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }
}

const setStoredGods = async (gods: any[]) => {
  if (typeof window === "undefined") {
    // Server-side: write to file
    await writeServerFile(godsFilePath, gods)
  } else {
    // Client-side: write to localStorage and also to server
    try {
      localStorage.setItem(GODS_STORAGE_KEY, JSON.stringify(gods))
      // Also sync to server
      await writeServerFile(godsFilePath, gods)
    } catch (error) {
      console.error("Failed to store gods:", error)
    }
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
  const users = await getStoredUsers()
  const passwords = await getStoredPasswords()
  
  console.log("Mock login attempt:", { 
    email, 
    password, 
    userCount: users.length,
    availableEmails: users.map(u => u.email),
    environment: typeof window === "undefined" ? "server" : "client"
  })

  // Find user by email
  const user = users.find((u) => u.email === email)
  if (!user) {
    console.log("User not found for email:", email)
    console.log("Available users:", users.map(u => ({ id: u.id, email: u.email })))
    return null
  }

  // Check password
  const storedPassword = passwords[email]
  if (!storedPassword || storedPassword !== password) {
    console.log("Password mismatch:", { provided: password, stored: storedPassword })
    return null
  }

  console.log("Login successful for:", email)
  const token = `mock-token-${user.id}-${Date.now()}`

  // Store token mapping
  const activeTokens = await getActiveTokens()
  activeTokens[token] = user.id
  await setActiveTokens(activeTokens)
  
  console.log("Token created and stored:", {
    token: token.substring(0, 30) + "...",
    userId: user.id,
    totalActiveTokens: Object.keys(activeTokens).length,
  })

  return { user, token }
}

export const mockRegister = async (username: string, email: string, password: string): Promise<MockUser | null> => {
  const users = await getStoredUsers()
  const passwords = await getStoredPasswords()
  
  console.log("Mock register attempt:", { 
    username, 
    email, 
    currentUsers: users.length,
    existingEmails: users.map(u => u.email),
    environment: typeof window === "undefined" ? "server" : "client"
  })

  // Check if user already exists
  const existingUser = users.find((u) => u.email === email || u.username === username)
  if (existingUser) {
    console.log("User already exists:", existingUser.email)
    return null
  }

  // Generate new user ID
  const maxId = users.reduce((max, user) => Math.max(max, parseInt(user.id)), 0)
  const newUser: MockUser = {
    id: (maxId + 1).toString(),
    username,
    email,
    isAdmin: false,
    isSuperAdmin: false,
    saisenBalance: 1000,
    createdAt: new Date().toISOString(),
  }

  // Add to users and passwords
  users.push(newUser)
  passwords[email] = password

  // Store in persistent storage
  await setStoredUsers(users)
  await setStoredPasswords(passwords)

  console.log("New user created:", newUser)
  console.log("Total users after creation:", users.length)
  return newUser
}

export const mockGetUserFromToken = async (token: string): Promise<MockUser | null> => {
  const users = await getStoredUsers()
  
  console.log("Getting user from token:", {
    token: token.substring(0, 30) + "...",
    totalUsers: users.length,
    environment: typeof window === "undefined" ? "server" : "client"
  })

  // Get active tokens
  const activeTokens = await getActiveTokens()
  console.log("Active tokens count:", Object.keys(activeTokens).length)

  // Check if token exists in active tokens
  const userId = activeTokens[token]
  if (userId) {
    const user = users.find((u) => u.id === userId)
    console.log("User found from active tokens:", { userId, found: !!user })
    return user || null
  }

  // If not found in active tokens, try to parse mock token format
  if (token.startsWith("mock-token-")) {
    const parts = token.split("-")
    if (parts.length >= 3) {
      const userId = parts[2]
      console.log("Parsing mock token:", { userId })
      const user = users.find((u) => u.id === userId)
      if (user) {
        // Add to active tokens for session management
        activeTokens[token] = user.id
        await setActiveTokens(activeTokens)
        console.log("Token added to active tokens")
        return user
      }
    }
  }

  console.log("Token validation failed")
  return null
}

export const forceAddToken = async (token: string, userId: string) => {
  const activeTokens = await getActiveTokens()
  activeTokens[token] = userId
  await setActiveTokens(activeTokens)
}

export const getActiveTokensCount = async () => Object.keys(await getActiveTokens()).length

export const getAllMockUsers = () => getStoredUsers()

export const mockUpdateUserBalance = async (userId: string, newBalance: number): Promise<boolean> => {
  const users = await getStoredUsers()
  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex === -1) {
    console.log("User not found for balance update:", userId)
    return false
  }

  const oldBalance = users[userIndex].saisenBalance
  users[userIndex].saisenBalance = newBalance
  await setStoredUsers(users)
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

  // Store in localStorage and file system
  const existingGods = await getStoredGods()
  existingGods.push(god)
  await setStoredGods(existingGods)

  console.log("God created:", { godId, totalGods: existingGods.length })
  return godId
}

export const mockGetGodById = async (godId: string): Promise<any | null> => {
  const gods = await getStoredGods()
  const god = gods.find((g) => g.id === godId)
  return god || null
}

export const mockGetUserGods = async (userId: string): Promise<any[]> => {
  const gods = await getStoredGods()
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

export const getAllMockGods = async (): Promise<any[]> => {
  return await getStoredGods()
}
