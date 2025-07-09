"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Crown, Users, TrendingUp, Send, Loader2, ArrowLeft, MessageCircle, User } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/layout/navbar"
import { useToast } from "@/hooks/use-toast"

interface God {
  id: string
  name: string
  description: string
  category: string
  mbtiType: string
  personality: string
  imageUrl?: string
  believersCount: number
  powerLevel: number
  createdAt: string
}

interface ChatMessage {
  id: string
  userId: string
  username: string
  message: string
  response?: string
  messageType: "user" | "god" | "believer"
  isGodMessage: boolean
  createdAt: string
}

export default function GodDetailPage({ params }: { params: { id: string } }) {
  const { user, token, isTokenValid } = useAuthStore()
  const router = useRouter()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [god, setGod] = useState<God | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || !token || !isTokenValid()) {
      router.push("/login")
      return
    }

    fetchGodData()
    fetchMessages()

    // ポーリングで新しいメッセージを取得
    pollIntervalRef.current = setInterval(fetchMessages, 3000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [user, token, isTokenValid, router, params.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchGodData = async () => {
    try {
      const response = await apiClient.get(`/api/gods/${params.id}`)
      setGod(response.god)
    } catch (error) {
      console.error("Failed to fetch god:", error)
      setError("神様の情報を取得できませんでした")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await apiClient.get(`/api/gods/${params.id}/chat`)
      setMessages(response.messages || [])
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    }
  }

  const isGodMention = (message: string): boolean => {
    const trimmed = message.trim()
    return trimmed.startsWith("@god ") || trimmed.startsWith("@GOD ") || trimmed === "@god" || trimmed === "@GOD"
  }

  const extractMessageContent = (message: string): string => {
    const trimmed = message.trim()
    if (trimmed.startsWith("@god ")) {
      return trimmed.substring(5).trim()
    }
    if (trimmed.startsWith("@GOD ")) {
      return trimmed.substring(5).trim()
    }
    if (trimmed === "@god" || trimmed === "@GOD") {
      return "こんにちは"
    }
    return trimmed
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const messageText = newMessage.trim()
    const isToGod = isGodMention(messageText)
    const actualMessage = isToGod ? extractMessageContent(messageText) : messageText

    setNewMessage("")

    try {
      if (isToGod) {
        // 神への質問
        const response = await apiClient.post("/api/chat", {
          godId: params.id,
          message: actualMessage,
        })

        toast({
          title: "神託を受けました",
          description: `${god?.name}からの返答が届きました`,
        })
      } else {
        // 信者同士の会話
        await apiClient.post(`/api/gods/${params.id}/chat`, {
          message: messageText,
          messageType: "believer",
        })

        toast({
          title: "メッセージを送信しました",
          description: "他の信者に向けてメッセージを送信しました",
        })
      }

      // メッセージリストを更新
      await fetchMessages()
    } catch (error) {
      console.error("Failed to send message:", error)
      setNewMessage(messageText) // エラー時はメッセージを復元
      toast({
        title: "エラー",
        description: "メッセージの送信に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const renderMessage = (message: ChatMessage) => {
    if (message.messageType === "god" || message.response) {
      // 神からの応答
      return (
        <div key={`${message.id}-god`} className="space-y-3">
          {/* ユーザーの質問 */}
          <div className="flex justify-end">
            <div className="flex items-end space-x-2">
              <div className="bg-purple-600 text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                <p className="text-sm">@god {message.message}</p>
              </div>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                  {message.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* 神の応答 */}
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={god?.imageUrl || "/placeholder.svg"} alt={god?.name} />
                <AvatarFallback className="bg-purple-600 text-white text-xs">
                  <Crown className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                <div className="flex items-center space-x-1 mb-1">
                  <Crown className="h-3 w-3 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-800">{god?.name}</span>
                </div>
                <p className="text-sm text-gray-800">{message.response}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(message.createdAt).toLocaleTimeString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    } else {
      // 信者同士の会話
      const isOwnMessage = message.userId === user?.id
      return (
        <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
          <div className={`flex items-end space-x-2 ${isOwnMessage ? "flex-row-reverse space-x-reverse" : ""}`}>
            <div
              className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${
                isOwnMessage ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              {!isOwnMessage && (
                <div className="flex items-center space-x-1 mb-1">
                  <User className="h-3 w-3 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-600">{message.username}</span>
                </div>
              )}
              <p className="text-sm">{message.message}</p>
              <p className={`text-xs mt-1 ${isOwnMessage ? "text-blue-100" : "text-gray-500"}`}>
                {new Date(message.createdAt).toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback className={`text-white text-xs ${isOwnMessage ? "bg-blue-600" : "bg-gray-600"}`}>
                {message.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      )
    }
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-xl text-purple-800">神様の情報を読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !god) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || "神様が見つかりません"}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                ダッシュボードに戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            ダッシュボードに戻る
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* God Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={god.imageUrl || "/placeholder.svg"} alt={god.name} />
                  <AvatarFallback className="bg-purple-600 text-white text-2xl">{god.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-purple-900">{god.name}</CardTitle>
                <CardDescription>{god.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">信者数</span>
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {god.believersCount}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">神力レベル</span>
                  <Badge variant="outline">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Lv.{god.powerLevel}
                  </Badge>
                </div>
                {god.mbtiType && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">性格タイプ</span>
                    <Badge variant="secondary">{god.mbtiType}</Badge>
                  </div>
                )}
                <Separator />
                <div className="pt-2">
                  <p className="text-xs text-gray-500">作成日: {new Date(god.createdAt).toLocaleDateString("ja-JP")}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  {god.name}の信者コミュニティ
                </CardTitle>
                <CardDescription>
                  <div className="space-y-1">
                    <p>
                      <strong>@god</strong> または <strong>@GOD</strong> で神様に直接質問できます
                    </p>
                    <p>それ以外のメッセージは他の信者と会話できます</p>
                  </div>
                </CardDescription>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">まだ会話がありません</p>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>
                        <code className="bg-gray-100 px-2 py-1 rounded">@god こんにちは</code> で神様に挨拶
                      </p>
                      <p>
                        <code className="bg-gray-100 px-2 py-1 rounded">よろしくお願いします</code> で信者と会話
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => renderMessage(message))
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`@god で神様に質問、または信者と会話...`}
                      disabled={isSending}
                      maxLength={500}
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim() || isSending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Crown className="h-3 w-3 text-purple-600" />
                      <span>
                        <code>@god</code> で神様に質問
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3 text-blue-600" />
                      <span>普通のメッセージで信者と会話</span>
                    </div>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
