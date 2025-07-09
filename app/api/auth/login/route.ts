import { type NextRequest, NextResponse } from "next/server"
import { mockLogin } from "@/lib/mock-auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "メールアドレスとパスワードは必須です" }, { status: 400 })
    }

    const result = await mockLogin(email, password)

    if (!result) {
      return NextResponse.json({ error: "メールアドレスまたはパスワードが正しくありません" }, { status: 401 })
    }

    return NextResponse.json({
      message: "ログインに成功しました",
      user: result.user,
      token: result.token,
    })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
