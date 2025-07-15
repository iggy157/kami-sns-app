"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Crown, Users, TrendingUp, MessageCircle, Plus } from "lucide-react"
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

  const fetchGods = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get("/api/gods", {
        Authorization: `Bearer ${token}`,
      })
      
      if (response.data?.gods) {
        setGods(response.data.gods)
        console.log("Fetched gods:", response.data.gods.length)
      } else {
        setGods([])
      }
    } catch (error) {
      console.error("Failed to fetch gods:", error)
      setGods([])
    } finally {
      setLoading(false)
    }
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
              <p className="text-purple-700">すべての神々と出会い、信仰を深めましょう</p>
            </div>
            <Link href="/gods/create">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                新しい神様を作成
              </Button>
            </Link>
          </div>
        </div>

        {/* Gods Grid */}
        {gods.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">まだ神様が作成されていません</h3>
                <p className="text-gray-500 mb-6">最初の神様を作成して、神々の世界を始めましょう</p>
                <Link href="/gods/create">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    最初の神様を作成する
                  </Button>
                </Link>
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