"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Crown, Plus } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/layout/navbar"

export default function ChatPage() {
  const { user, token, isTokenValid, isHydrated } = useAuthStore()
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Wait for Zustand hydration before checking auth
    if (!isHydrated) {
      console.log("Waiting for store hydration...")
      return
    }

    // Prevent multiple authentication checks
    if (authChecked) {
      console.log("Authentication already verified for chat page")
      return
    }

    if (!user || !token || !isTokenValid()) {
      console.log("Authentication failed, redirecting to login")
      router.push("/login")
      return
    }

    console.log("Authentication successful for chat page")
    setAuthChecked(true)
  }, [user, token, isTokenValid, router, isHydrated, authChecked])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-900 mb-2">チャット</h1>
          <p className="text-purple-700">神様との対話を楽しみましょう</p>
        </div>

        {/* Chat Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-600" />
                神様と対話
              </CardTitle>
              <CardDescription>
                あなたが作成した神様や他のユーザーが作成した神様と直接対話できます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/gods">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  神様一覧から選ぶ
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                新しい神様を作成
              </CardTitle>
              <CardDescription>
                AIで独自の神様を作成して、その神様と対話を始めましょう
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/gods/create">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  神様を作成する
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>チャットの使い方</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">神様への質問</h3>
                <p className="text-gray-600 text-sm">
                  神様の個別ページで「@god」と入力して質問すると、その神様から回答を得られます。
                  人生の悩みや迷いについて相談してみましょう。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">信者との交流</h3>
                <p className="text-gray-600 text-sm">
                  同じ神様を信仰する他のユーザーとも交流できます。
                  神様への信仰を通じてコミュニティを築きましょう。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 