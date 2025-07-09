"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Crown, Loader2, Coins, ArrowLeft, ChevronLeft, ChevronRight, Save } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/layout/navbar"
import { useToast } from "@/hooks/use-toast"

const MBTI_TYPES = [
  { value: "INTJ", label: "INTJ - 建築家" },
  { value: "INTP", label: "INTP - 論理学者" },
  { value: "ENTJ", label: "ENTJ - 指揮官" },
  { value: "ENTP", label: "ENTP - 討論者" },
  { value: "INFJ", label: "INFJ - 提唱者" },
  { value: "INFP", label: "INFP - 仲介者" },
  { value: "ENFJ", label: "ENFJ - 主人公" },
  { value: "ENFP", label: "ENFP - 運動家" },
  { value: "ISTJ", label: "ISTJ - 管理者" },
  { value: "ISFJ", label: "ISFJ - 擁護者" },
  { value: "ESTJ", label: "ESTJ - 幹部" },
  { value: "ESFJ", label: "ESFJ - 領事" },
  { value: "ISTP", label: "ISTP - 巨匠" },
  { value: "ISFP", label: "ISFP - 冒険家" },
  { value: "ESTP", label: "ESTP - 起業家" },
  { value: "ESFP", label: "ESFP - エンターテイナー" },
]

const CATEGORIES = [
  { value: "love", label: "恋愛・人間関係" },
  { value: "work", label: "仕事・キャリア" },
  { value: "health", label: "健康・ウェルネス" },
  { value: "money", label: "お金・財運" },
  { value: "study", label: "学習・成長" },
  { value: "family", label: "家族・子育て" },
  { value: "spiritual", label: "スピリチュアル" },
  { value: "general", label: "総合・その他" },
]

const COLOR_THEMES = [
  { value: "purple", label: "紫 - 神秘的", color: "bg-purple-500" },
  { value: "gold", label: "金 - 威厳", color: "bg-yellow-500" },
  { value: "blue", label: "青 - 知恵", color: "bg-blue-500" },
  { value: "red", label: "赤 - 情熱", color: "bg-red-500" },
  { value: "green", label: "緑 - 自然", color: "bg-green-500" },
  { value: "silver", label: "銀 - 純粋", color: "bg-gray-400" },
  { value: "pink", label: "桃 - 愛情", color: "bg-pink-500" },
  { value: "orange", label: "橙 - 活力", color: "bg-orange-500" },
]

const DRAFT_STORAGE_KEY = "god_creation_draft"

export default function CreateGodPage() {
  const { user, token, isTokenValid } = useAuthStore()
  const router = useRouter()
  const { toast } = useToast()

  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    // 基本情報
    name: "",
    deity: "",
    category: "",

    // 神格・信念
    beliefs: "",
    special_skills: "",
    scenario: "",

    // 性格・話し方
    personality: "",
    speech_style: "",
    action_style: "",
    mbtiType: "",
    bigFiveTraits: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    },

    // 関係性
    likes: "",
    dislikes: "",
    relationship_with_humans: "",
    relationship_with_followers: "",
    limitations: "",

    // テーマ色
    colorTheme: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const steps = [
    { title: "基本情報", icon: "🏛️" },
    { title: "神格・信念", icon: "⚡" },
    { title: "性格・話し方", icon: "💭" },
    { title: "関係性", icon: "🤝" },
    { title: "テーマ色", icon: "🎨" },
  ]

  // 自動保存機能
  const saveToLocalStorage = useCallback(() => {
    try {
      setIsSaving(true)
      const draftData = {
        ...formData,
        activeStep,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData))
      setLastSaved(new Date())
      console.log("Draft saved to localStorage")
    } catch (error) {
      console.error("Failed to save draft:", error)
    } finally {
      setIsSaving(false)
    }
  }, [formData, activeStep])

  // 下書きを読み込み
  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (saved) {
        const draftData = JSON.parse(saved)
        const { activeStep: savedStep, savedAt, ...savedFormData } = draftData

        setFormData(savedFormData)
        setActiveStep(savedStep || 0)
        setLastSaved(new Date(savedAt))

        toast({
          title: "下書きを復元しました",
          description: `${new Date(savedAt).toLocaleString("ja-JP")}に保存された内容を復元しました`,
        })

        console.log("Draft loaded from localStorage")
      }
    } catch (error) {
      console.error("Failed to load draft:", error)
    }
  }, [toast])

  // 下書きをクリア
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      setLastSaved(null)
      console.log("Draft cleared from localStorage")
    } catch (error) {
      console.error("Failed to clear draft:", error)
    }
  }, [])

  useEffect(() => {
    if (!user || !token || !isTokenValid()) {
      router.push("/login")
      return
    }

    // 初回読み込み時に下書きを復元
    loadFromLocalStorage()
  }, [user, token, isTokenValid, router, loadFromLocalStorage])

  // フォームデータが変更されたら自動保存（デバウンス付き）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToLocalStorage()
    }, 2000) // 2秒後に保存

    return () => clearTimeout(timeoutId)
  }, [formData, activeStep, saveToLocalStorage])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleBigFiveChange = (trait: string, value: number[]) => {
    setFormData((prev) => ({
      ...prev,
      bigFiveTraits: {
        ...prev.bigFiveTraits,
        [trait]: value[0],
      },
    }))
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.name.trim() && formData.deity.trim() && formData.category
      case 1:
        return formData.beliefs.trim() && formData.special_skills.trim() && formData.scenario.trim()
      case 2:
        return (
          formData.personality.trim() &&
          formData.speech_style.trim() &&
          formData.action_style.trim() &&
          formData.mbtiType
        )
      case 3:
        return formData.relationship_with_humans.trim() && formData.relationship_with_followers.trim()
      case 4:
        return formData.colorTheme
      default:
        return true
    }
  }

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1)
    }
  }

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError("")

    try {
      if (!isStepValid(activeStep)) {
        throw new Error("すべての必須項目を入力してください")
      }

      // 認証状態を再確認
      if (!user || !token) {
        throw new Error("認証情報が見つかりません。再ログインしてください。")
      }

      // トークンの有効性を確認
      const isValid = await useAuthStore.getState().verifyToken()
      if (!isValid) {
        throw new Error("認証が無効です。再ログインしてください。")
      }

      console.log("Creating god with authenticated user:", {
        userId: user.id,
        username: user.username,
        hasToken: !!token,
        tokenPreview: token.substring(0, 20) + "...",
      })

      // プロンプト生成用のデータを整理
      const godData = {
        ...formData,
        description: `${formData.deity}として${formData.beliefs}を信念とし、${formData.special_skills}を特技とする神様`,
      }

      const response = await apiClient.post("/api/gods/create", godData)

      // 成功時に下書きをクリア
      clearDraft()

      toast({
        title: "神様作成完了！",
        description: `${formData.name}が誕生しました！`,
      })

      router.push(`/gods/${response.godId}`)
    } catch (error) {
      console.error("God creation error:", error)

      if (error instanceof Error) {
        if (error.message.includes("認証") || error.message.includes("無効")) {
          // 認証エラーの場合はログインページにリダイレクト
          useAuthStore.getState().logout()
          router.push("/login")
          return
        }
        setError(error.message)
      } else {
        setError("神様の作成に失敗しました")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">✨ 神様の基本情報を入力してください ✨</h2>
              <p className="text-gray-600">神様の名前と基本的な属性を設定しましょう</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">🏛️ 神様の名前 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="例: 筋トレ神、週休2日制神"
                  maxLength={50}
                />
                <p className="text-sm text-gray-500 mt-1">神様の名前を入力してください（必須）</p>
              </div>

              <div>
                <Label htmlFor="deity">🏛️ 神格 *</Label>
                <Input
                  id="deity"
                  value={formData.deity}
                  onChange={(e) => handleInputChange("deity", e.target.value)}
                  placeholder="例: 筋肉の神、労働の神、恋愛の神"
                  maxLength={100}
                />
                <p className="text-sm text-gray-500 mt-1">どのような分野の神様かを表現してください</p>
              </div>

              <div>
                <Label htmlFor="category">📂 専門分野 *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="神様の専門分野を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">⚡ 神格・信念・特技を入力してください</h2>
              <p className="text-gray-600">神様の核となる信念と能力を定義しましょう</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="beliefs">💫 信念 *</Label>
                <Textarea
                  id="beliefs"
                  value={formData.beliefs}
                  onChange={(e) => handleInputChange("beliefs", e.target.value)}
                  placeholder="例: 努力は必ず報われる、愛こそが全ての源である"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-sm text-gray-500 mt-1">神様が大切にしている価値観や信念</p>
              </div>

              <div>
                <Label htmlFor="special_skills">🌟 特技 *</Label>
                <Textarea
                  id="special_skills"
                  value={formData.special_skills}
                  onChange={(e) => handleInputChange("special_skills", e.target.value)}
                  placeholder="例: 筋肉を瞬時に成長させる、心の傷を癒す、運命の相手を見つける"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-sm text-gray-500 mt-1">神様が持つ特別な能力や得意分野</p>
              </div>

              <div>
                <Label htmlFor="scenario">📖 背景・設定 *</Label>
                <Textarea
                  id="scenario"
                  value={formData.scenario}
                  onChange={(e) => handleInputChange("scenario", e.target.value)}
                  placeholder="例: 現代社会で働く人々の疲労を見かねて降臨した、古代から愛を司ってきた"
                  rows={3}
                  maxLength={300}
                />
                <p className="text-sm text-gray-500 mt-1">神様の誕生や活動の背景</p>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">💭 性格・話し方を設定してください</h2>
              <p className="text-gray-600">神様の個性と人格を詳しく設定しましょう</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="personality">😊 性格 *</Label>
                <Textarea
                  id="personality"
                  value={formData.personality}
                  onChange={(e) => handleInputChange("personality", e.target.value)}
                  placeholder="例: 優しく包容力があり、時に厳しく指導する。ユーモアを交えて話すのが好き"
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="speech_style">🗣️ 話し方 *</Label>
                <Textarea
                  id="speech_style"
                  value={formData.speech_style}
                  onChange={(e) => handleInputChange("speech_style", e.target.value)}
                  placeholder="例: 関西弁で親しみやすく、敬語と砕けた言葉を使い分ける"
                  rows={2}
                  maxLength={150}
                />
              </div>

              <div>
                <Label htmlFor="action_style">⚡ 行動スタイル *</Label>
                <Textarea
                  id="action_style"
                  value={formData.action_style}
                  onChange={(e) => handleInputChange("action_style", e.target.value)}
                  placeholder="例: 直接的にアドバイスし、時には厳しく叱咤激励する"
                  rows={2}
                  maxLength={150}
                />
              </div>

              <div>
                <Label htmlFor="mbtiType">🧠 MBTI性格タイプ *</Label>
                <Select value={formData.mbtiType} onValueChange={(value) => handleInputChange("mbtiType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="神様の性格タイプを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {MBTI_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Big Five 性格特性 */}
              <div className="space-y-4">
                <Label>🎯 ビッグファイブ性格特性</Label>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { key: "openness", label: "開放性", desc: "新しい経験への開放度" },
                    { key: "conscientiousness", label: "誠実性", desc: "責任感と自制心" },
                    { key: "extraversion", label: "外向性", desc: "社交性とエネルギー" },
                    { key: "agreeableness", label: "協調性", desc: "他者への思いやり" },
                    { key: "neuroticism", label: "神経症傾向", desc: "感情の不安定さ" },
                  ].map((trait) => (
                    <div key={trait.key} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{trait.label}</span>
                        <Badge variant="outline">
                          {formData.bigFiveTraits[trait.key as keyof typeof formData.bigFiveTraits]}%
                        </Badge>
                      </div>
                      <Slider
                        value={[formData.bigFiveTraits[trait.key as keyof typeof formData.bigFiveTraits]]}
                        onValueChange={(value) => handleBigFiveChange(trait.key, value)}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">{trait.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">🤝 関係性を設定してください</h2>
              <p className="text-gray-600">神様と人間、信者との関係性を定義しましょう</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="likes">❤️ 好きなもの</Label>
                <Input
                  id="likes"
                  value={formData.likes}
                  onChange={(e) => handleInputChange("likes", e.target.value)}
                  placeholder="例: 努力する人、素直な心、美味しい食べ物"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="dislikes">💔 嫌いなもの</Label>
                <Input
                  id="dislikes"
                  value={formData.dislikes}
                  onChange={(e) => handleInputChange("dislikes", e.target.value)}
                  placeholder="例: 怠惰、嘘、諦めること"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="relationship_with_humans">👥 人間との関係性 *</Label>
                <Textarea
                  id="relationship_with_humans"
                  value={formData.relationship_with_humans}
                  onChange={(e) => handleInputChange("relationship_with_humans", e.target.value)}
                  placeholder="例: 親しみやすく接し、時には厳しく指導する師匠のような存在"
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="relationship_with_followers">🙏 信者との関係性 *</Label>
                <Textarea
                  id="relationship_with_followers"
                  value={formData.relationship_with_followers}
                  onChange={(e) => handleInputChange("relationship_with_followers", e.target.value)}
                  placeholder="例: 家族のように温かく見守り、成長を喜び、困った時は必ず助ける"
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="limitations">⚠️ 制約・限界</Label>
                <Textarea
                  id="limitations"
                  value={formData.limitations}
                  onChange={(e) => handleInputChange("limitations", e.target.value)}
                  placeholder="例: 本人の努力なしには力を発揮できない、一日一回しか奇跡を起こせない"
                  rows={2}
                  maxLength={150}
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">🎨 テーマ色を選択してください</h2>
              <p className="text-gray-600">神様のイメージカラーを選びましょう</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {COLOR_THEMES.map((theme) => (
                <Card
                  key={theme.value}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    formData.colorTheme === theme.value ? "ring-2 ring-purple-500" : ""
                  }`}
                  onClick={() => handleInputChange("colorTheme", theme.value)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-full ${theme.color} mx-auto mb-2`}></div>
                    <p className="text-sm font-medium">{theme.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            ダッシュボードに戻る
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-900 mb-2">新しい神様を作成</h1>
              <p className="text-purple-700">詳細な設定であなただけの神様をAIで作成しましょう</p>
            </div>
            {/* 自動保存状態表示 */}
            <div className="text-right">
              {isSaving && (
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Save className="h-4 w-4 mr-1 animate-pulse" />
                  保存中...
                </div>
              )}
              {lastSaved && (
                <div className="text-xs text-gray-500">最終保存: {lastSaved.toLocaleTimeString("ja-JP")}</div>
              )}
            </div>
          </div>
        </div>

        {/* Balance Display */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">現在の賽銭残高</p>
                <p className="text-2xl font-bold">{user.saisenBalance}</p>
              </div>
              <div className="text-right">
                <p className="text-purple-100">作成コスト</p>
                <p className="text-2xl font-bold">500</p>
              </div>
              <Coins className="h-8 w-8 text-yellow-300" />
            </div>
            {user.saisenBalance < 500 && (
              <Alert className="mt-4 bg-red-100 border-red-300">
                <AlertDescription className="text-red-800">
                  賽銭が不足しています。神様を作成するには500賽銭が必要です。
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= activeStep ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index < activeStep ? "✓" : step.icon}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-1 mx-2 ${index < activeStep ? "bg-purple-600" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-purple-900">
                ステップ {activeStep + 1}: {steps[activeStep].title}
              </h3>
            </div>
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card>
          <CardContent className="p-8">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={activeStep === 0}
                className="flex items-center bg-transparent"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>

              {activeStep < steps.length - 1 ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid(activeStep)}
                  className="bg-purple-600 hover:bg-purple-700 flex items-center"
                >
                  次へ
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid(activeStep) || isLoading || user.saisenBalance < 500}
                  className="bg-purple-600 hover:bg-purple-700 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      神様を作成中...
                    </>
                  ) : (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      神様を作成する（500賽銭）
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
