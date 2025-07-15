import { type NextRequest, NextResponse } from "next/server"
import { mockGetUserFromToken, getAllMockGods } from "@/lib/mock-auth"

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

    // Get all gods from all users
    const gods = await getAllMockGods()

    const formattedGods = gods.map((god) => ({
      id: god.id,
      name: god.name,
      description: god.description,
      category: god.category,
      mbtiType: god.mbtiType,
      imageUrl: god.imageUrl,
      believersCount: god.believersCount || 0,
      powerLevel: god.powerLevel || 1,
      createdAt: god.createdAt,
      creatorUsername: god.creatorUsername,
      colorTheme: god.colorTheme,
    }))

    // Sort by creation date (newest first)
    const sortedGods = formattedGods.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({ gods: sortedGods })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
} 