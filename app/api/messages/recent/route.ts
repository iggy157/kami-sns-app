import { type NextRequest, NextResponse } from "next/server"
import { mockGetUserFromToken, mockGetUserMessages, mockGetGodById } from "@/lib/mock-auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const user = await mockGetUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "無効なトークンです" }, { status: 401 })
    }

    const messages = await mockGetUserMessages(user.id)

    // Get god names for each message
    const formattedMessages = await Promise.all(
      messages.map(async (message) => {
        const god = await mockGetGodById(message.godId)
        return {
          id: message.id,
          message: message.message,
          response: message.response,
          godName: god?.name || "不明な神様",
          createdAt: message.createdAt,
        }
      }),
    )

    return NextResponse.json({ messages: formattedMessages })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
