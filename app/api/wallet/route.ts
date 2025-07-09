import { type NextRequest, NextResponse } from "next/server"
import { mockGetUserFromToken } from "@/lib/mock-auth"

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

    return NextResponse.json({
      balance: user.saisenBalance || 1000,
    })
  } catch (error) {
    console.error("Wallet API error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
