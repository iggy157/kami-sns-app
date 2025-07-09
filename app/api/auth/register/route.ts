import { type NextRequest, NextResponse } from "next/server"
import { mockRegister } from "@/lib/mock-auth"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: "すべての項目を入力してください" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "パスワードは6文字以上で入力してください" }, { status: 400 })
    }

    const user = await mockRegister(username, email, password)

    if (!user) {
      return NextResponse.json({ error: "このメールアドレスまたはユーザー名は既に使用されています" }, { status: 409 })
    }

    return NextResponse.json({
      message: "アカウントが正常に作成されました",
      user,
    })
  } catch (error) {
    console.error("Registration API error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
