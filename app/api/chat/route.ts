import { type NextRequest, NextResponse } from "next/server"
import { mockGetUserFromToken, mockGetGodById, mockSaveMessage, mockGetCommunityMessages } from "@/lib/mock-auth"
import { generateGodResponse } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const user = await mockGetUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "無効なトークンです" }, { status: 401 })
    }

    const { godId, message } = await request.json()
    if (!godId || !message) {
      return NextResponse.json({ error: "神様IDとメッセージは必須です" }, { status: 400 })
    }

    // Get god information
    const god = await mockGetGodById(godId)
    if (!god) {
      return NextResponse.json({ error: "神様が見つかりません" }, { status: 404 })
    }

    // Get conversation history for better context
    const allMessages = await mockGetCommunityMessages(godId)
    const conversationHistory = allMessages
      .filter((m: any) => m.userId === user.id && m.response && m.messageType === "god")
      .slice(-5) // 最新5件の会話履歴
      .map((m: any) => ({
        message: m.message,
        response: m.response,
      }))

    // Parse god personality data
    let personalityData = {}
    try {
      personalityData = typeof god.personality === "string" ? JSON.parse(god.personality) : god.personality || {}
    } catch (error) {
      console.error("Personality parsing error:", error)
    }

    const godInfo = {
      id: god.id,
      name: god.name,
      description: god.description,
      personality: personalityData.personality || god.personality || "慈愛深く知恵に満ちている",
      mbtiType: god.mbtiType || personalityData.mbtiType || "ENFJ",
      powerLevel: god.powerLevel || 1,
      deity: god.deity || personalityData.deity,
      beliefs: god.beliefs || personalityData.beliefs,
      special_skills: god.special_skills || personalityData.special_skills,
    }

    console.log("Generating AI response for:", {
      godName: god.name,
      userMessage: message,
      historyCount: conversationHistory.length,
    })

    // Generate AI response with conversation history
    const response = await generateGodResponse(godInfo, message, conversationHistory)

    // Save message and response (神への質問として保存)
    await mockSaveMessage({
      userId: user.id,
      username: user.username,
      godId: godId,
      message: message,
      response: response,
      messageType: "god",
      isGodMessage: true,
    })

    console.log("AI response generated successfully:", {
      responseLength: response.length,
      godName: god.name,
    })

    return NextResponse.json({
      response,
      godName: god.name,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        error: "チャットの処理に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
