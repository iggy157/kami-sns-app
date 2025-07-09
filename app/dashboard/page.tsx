"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Crown, Users, MessageCircle, Plus, Coins, TrendingUp } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/layout/navbar"

interface God {
  id: string
  name: string
  description: string
  imageUrl?: string
  believersCount: number
  powerLevel: number
}

interface RecentMessage {
  id: string
  godName: string
  message: string
  response: string
  createdAt: string
}

export default function DashboardPage() {
  const { user, token, isTokenValid } = useAuthStore()
  const router = useRouter()
  const [gods, setGods] = useState<God[]>([])
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([])
  const [stats, setStats] = useState({
    totalGods: 0,
    totalBelievers: 0,
    totalMessages: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    if (!user || !token || !isTokenValid()) {
      console.log("No user or invalid token, redirecting to login")
      router.push("/login")
      return
    }

    console.log("User authenticated, loading dashboard for:", user.username)
    fetchDashboardData()
  }, [user, token, router, isTokenValid])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch user's gods
      try {
        const godsData = await apiClient.get("/api/gods/my-gods")
        setGods(godsData.gods || [])
      } catch (error) {
        console.error("Failed to fetch gods:", error)
        setGods([])
      }

      // Fetch recent messages
      try {
        const messagesData = await apiClient.get("/api/messages/recent")
        setRecentMessages(messagesData.messages || [])
      } catch (error) {
        console.error("Failed to fetch recent messages:", error)
        setRecentMessages([])
      }

      console.log("Dashboard loaded successfully for user:", user?.username)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Update stats when data changes
  useEffect(() => {
    setStats({
      totalGods: gods.length,
      totalBelievers: gods.reduce((sum, god) => sum + god.believersCount, 0),
      totalMessages: recentMessages.length,
    })
  }, [gods, recentMessages])

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-xl text-purple-800">ダッシュボードを読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-900 mb-2">おかえりなさい、{user.username}さん</h1>
          <p className="text-purple-700">神々との対話と信仰の世界へようこそ</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">賽銭残高</p>
                  <p className="text-2xl font-bold">{user.saisenBalance}</p>
                </div>
                <Coins className="h-8 w-8 text-yellow-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">あなたの神様</p>
                  <p className="text-2xl font-bold">{stats.totalGods}</p>
                </div>
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">総信者数</p>
                  <p className="text-2xl font-bold">{stats.totalBelievers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">メッセージ数</p>
                  <p className="text-2xl font-bold">{stats.totalMessages}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Gods */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  あなたの神様
                </CardTitle>
                <Link href="/gods/create">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    新しい神様を作成
                  </Button>
                </Link>
              </div>
              <CardDescription>あなたが作成した神様たち</CardDescription>
            </CardHeader>
            <CardContent>
              {gods.length === 0 ? (
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">まだ神様を作成していません</p>
                  <Link href="/gods/create">
                    <Button className="bg-purple-600 hover:bg-purple-700">最初の神様を作成する</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {gods.slice(0, 3).map((god) => (
                    <div key={god.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={god.imageUrl || "/placeholder.svg"} alt={god.name} />
                        <AvatarFallback className="bg-purple-600 text-white">{god.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-purple-900">{god.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">{god.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="secondary">
                            <Users className="h-3 w-3 mr-1" />
                            {god.believersCount}
                          </Badge>
                          <Badge variant="outline">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Lv.{god.powerLevel}
                          </Badge>
                        </div>
                      </div>
                      <Link href={`/gods/${god.id}`}>
                        <Button variant="outline" size="sm">
                          詳細
                        </Button>
                      </Link>
                    </div>
                  ))}
                  {gods.length > 3 && (
                    <div className="text-center">
                      <Button variant="outline">すべて見る</Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                最近の神託
              </CardTitle>
              <CardDescription>最近の神様との対話</CardDescription>
            </CardHeader>
            <CardContent>
              {recentMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">まだ神様との対話がありません</p>
                  <Link href="/gods/create">
                    <Button className="bg-purple-600 hover:bg-purple-700">神様を作成して対話する</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentMessages.slice(0, 3).map((message) => (
                    <div key={message.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="h-4 w-4 text-purple-600" />
                        <span className="font-semibold text-purple-900">{message.godName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">あなた: {message.message}</p>
                      <p className="text-sm text-purple-800 bg-purple-50 p-2 rounded">{message.response}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
