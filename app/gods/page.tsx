"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Crown, Users, TrendingUp, MessageCircle, Plus, RefreshCw, AlertCircle } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/layout/navbar"

interface God {
  id: string
  name: string
  description: string
  category: string
  mbtiType: string
  imageUrl?: string
  believersCount: number
  powerLevel: number
  createdAt: string
}

export default function GodsPage() {
  const { user, token, isTokenValid, isHydrated } = useAuthStore()
  const router = useRouter()
  const [gods, setGods] = useState<God[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Wait for Zustand hydration before checking auth
    if (!isHydrated) {
      console.log("Waiting for store hydration...")
      return
    }

    // Prevent multiple authentication checks
    if (authChecked) {
      console.log("Authentication already verified for gods page")
      return
    }

    if (!user || !token || !isTokenValid()) {
      console.log("Authentication failed, redirecting to login")
      router.push("/login")
      return
    }

    console.log("Authentication successful for gods page")
    setAuthChecked(true)
    fetchGods()
  }, [user, token, isTokenValid, router, isHydrated, authChecked])

  // Auto-refresh when page becomes visible (for when user returns from god creation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && authChecked && user && token && isTokenValid()) {
        console.log("Page became visible, refreshing gods list...")
        fetchGods()
      }
    }

    const handleFocus = () => {
      if (authChecked && user && token && isTokenValid()) {
        console.log("Window focused, refreshing gods list...")
        fetchGods()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [authChecked, user, token, isTokenValid])

  const fetchGods = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      console.log("=== Fetching Gods ===")
      console.log("Token:", token?.substring(0, 30) + "...")
      console.log("User:", user?.username)
      console.log("Manual refresh:", isManualRefresh)
      
      const response = await apiClient.get("/api/gods", {
        Authorization: `Bearer ${token}`,
      })
      
      console.log("Full API Response:", response)
      console.log("Response data:", response.data)
      console.log("Response gods:", response.data?.gods)
      
      if (response && response.gods) {
        setGods(response.gods)
        console.log("✅ Set gods from response.gods:", response.gods.length)
      } else if (response.data && response.data.gods) {
        setGods(response.data.gods)
        console.log("✅ Set gods from response.data.gods:", response.data.gods.length)
      } else if (response && Array.isArray(response)) {
        setGods(response)
        console.log("✅ Set gods from array response:", response.length)
      } else {
        console.log("❌ No gods found in response, setting empty array")
        console.log("Response structure:", Object.keys(response || {}))
        setGods([])
      }
    } catch (error) {
      console.error("❌ Failed to fetch gods:", error)
      console.error("Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.status,
        code: (error as any)?.code
      })
      
      const errorMessage = error instanceof Error ? error.message : '神様一覧の取得に失敗しました'
      setError(errorMessage)
      setGods([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleManualRefresh = () => {
    fetchGods(true)
  }

  // Show loading while waiting for authentication
  if (!isHydrated || !authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-xl text-purple-800">認証を確認中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-xl text-purple-800">神様一覧を読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-900 mb-2">神様一覧</h1>
              <p className="text-purple-700">
                すべての神々と出会い、信仰を深めましょう
                {gods.length > 0 && ` (${gods.length}柱の神様)`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleManualRefresh}
                disabled={refreshing}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? '更新中...' : '最新に更新'}
              </Button>
              <Link href="/gods/create">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  新しい神様を作成
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <Button 
                    onClick={handleManualRefresh} 
                    variant="outline" 
                    size="sm"
                    className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
                  >
                    再試行
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gods Grid */}
        {gods.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {error ? '神様一覧を表示できません' : 'まだ神様が作成されていません'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {error 
                    ? 'エラーが発生しました。上記のエラー情報を確認して再試行してください。' 
                    : '最初の神様を作成して、神々の世界を始めましょう'
                  }
                </p>
                {!error && (
                  <Link href="/gods/create">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      最初の神様を作成する
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gods.map((god) => (
              <Card key={god.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={god.imageUrl || "/placeholder.svg"} alt={god.name} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {god.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-purple-900">{god.name}</CardTitle>
                      <CardDescription>{god.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {god.believersCount} 信者
                      </Badge>
                      <Badge variant="outline">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Lv.{god.powerLevel}
                      </Badge>
                      <Badge variant="outline">
                        {god.mbtiType}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/gods/${god.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          対話する
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 