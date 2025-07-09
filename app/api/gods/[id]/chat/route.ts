import { type NextRequest, NextResponse } from "next/server"
import { mockGetUserFromToken, mockSaveMessage } from "@/lib/mock-auth"

// 信者コミュニティのメッセージを取得
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authorization = request.headers.get("authorization")
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const token = authorization.split(" ")[1]
    const user = await mockGetUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "無効なトークンです" }, { status: 401 })
    }

    const godId = params.id
    const messages = await mockGetCommunityMessages(godId)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Get community messages error:", error)
    return NextResponse.json({ error: "メッセージの取得に失敗しました" }, { status: 500 })
  }
}

// 信者コミュニティにメッセージを投稿
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authorization = request.headers.get("authorization")
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const token = authorization.split(" ")[1]
    const user = await mockGetUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "無効なトークンです" }, { status: 401 })
    }

    const { message, messageType = "believer" } = await request.json()
    if (!message) {
      return NextResponse.json({ error: "メッセージは必須です" }, { status: 400 })
    }

    const godId = params.id

    // 信者メッセージを保存
    await mockSaveMessage({
      userId: user.id,
      username: user.username,
      godId: godId,
      message: message,
      messageType: messageType,
      isGodMessage: false,
    })

    return NextResponse.json({
      message: "メッセージが送信されました",
      success: true,
    })
  } catch (error) {
    console.error("Post community message error:", error)
    return NextResponse.json({ error: "メッセージの送信に失敗しました" }, { status: 500 })
  }
}

// コミュニティメッセージ取得関数（mock-auth.tsに追加する関数）
async function mockGetCommunityMessages(godId: string): Promise<any[]> {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem("mock_messages_data")
    const allMessages = stored ? JSON.parse(stored) : []

    // 指定された神様のメッセージを取得（神の応答と信者メッセージ両方）
    const godMessages = allMessages
      .filter((m: any) => m.godId === godId)
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    return godMessages
  } catch {
    return []
  }
}
