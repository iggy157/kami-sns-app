import { type NextRequest, NextResponse } from "next/server"
import { mockGetUserFromToken } from "@/lib/mock-auth"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "トークンが必要です" }, { status: 400 })
    }

    const user = await mockGetUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: "無効なトークンです" }, { status: 401 })
    }

    return NextResponse.json({
      message: "トークンが有効です",
      user,
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
