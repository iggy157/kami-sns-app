import { type NextRequest, NextResponse } from "next/server"
import { mockGetUserFromToken, mockGetUserGods } from "@/lib/mock-auth"

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

    const gods = await mockGetUserGods(user.id)

    const formattedGods = gods.map((god) => ({
      id: god.id,
      name: god.name,
      description: god.description,
      imageUrl: god.imageUrl,
      believersCount: god.believersCount || 0,
      powerLevel: god.powerLevel || 1,
      createdAt: god.createdAt,
    }))

    return NextResponse.json({ gods: formattedGods })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
