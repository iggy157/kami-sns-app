"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, MessageCircle, Users, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, isTokenValid, isHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Wait for Zustand hydration before checking auth
    if (!isHydrated) {
      console.log("Waiting for store hydration...")
      return
    }

    // If user is already logged in, redirect to dashboard
    if (user && isTokenValid()) {
      console.log("User already authenticated, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [user, isTokenValid, router, isHydrated])

  const features = [
    {
      icon: Crown,
      title: "神様を作成",
      description: "あなただけの神様をAIで作成し、独自の個性と力を与えましょう",
    },
    {
      icon: MessageCircle,
      title: "神託を受ける",
      description: "作成した神様と対話し、人生の悩みや疑問に答えてもらいましょう",
    },
    {
      icon: Users,
      title: "信者を集める",
      description: "他のユーザーがあなたの神様を信仰し、コミュニティを形成します",
    },
    {
      icon: Sparkles,
      title: "神力を高める",
      description: "信者が増えるほど神様の力が強くなり、より深い洞察を得られます",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-purple-900">kAmI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">ログイン</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-purple-600 hover:bg-purple-700">新規登録</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-purple-900 mb-6">
            神様生成開宗SNS
            <br />
            <span className="text-purple-600">kAmI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AIの力で自分だけの神様を作成し、神託を受けながら信者コミュニティを築く、 新しいソーシャルプラットフォーム
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3">
                今すぐ始める
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent">
                ログイン
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-purple-900 mb-4">kAmIでできること</h2>
            <p className="text-xl text-gray-600">神様との対話を通じて、新しい体験を始めましょう</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-purple-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-purple-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">あなたの神様を作成しませんか？</h2>
          <p className="text-xl text-purple-100 mb-8">今すぐ登録して、AIが生成する神様との対話を始めましょう</p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3">
              無料で始める
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">kAmI</span>
          </div>
          <p className="text-gray-400">© 2024 kAmI - 神様生成開宗SNS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
