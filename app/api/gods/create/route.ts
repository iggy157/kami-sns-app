import { type NextRequest, NextResponse } from "next/server"
import { mockGetUserFromToken, mockUpdateUserBalance, mockCreateGod } from "@/lib/mock-auth"

// 詳細なプロンプト生成関数
function generateGodPrompt(godData: any): string {
  const {
    name,
    deity,
    beliefs,
    special_skills,
    personality,
    speech_style,
    action_style,
    likes,
    dislikes,
    relationship_with_humans,
    relationship_with_followers,
    limitations,
    scenario,
    bigFiveTraits,
    mbtiType,
  } = godData

  let prompt = `${name}は${scenario}に直面している。${name}は${deity}であり、信念として「${beliefs}」を持っている。`
  prompt += `${name}の特技は${special_skills}で、性格は「${personality}」である。`

  // ビッグファイブ性格特性を追加
  if (bigFiveTraits) {
    prompt += `性格特性として、開放性${bigFiveTraits.openness}%、誠実性${bigFiveTraits.conscientiousness}%、`
    prompt += `外向性${bigFiveTraits.extraversion}%、協調性${bigFiveTraits.agreeableness}%、`
    prompt += `神経症傾向${bigFiveTraits.neuroticism}%を持つ。`
  }

  // MBTIタイプを追加
  if (mbtiType) {
    prompt += `MBTI性格タイプは${mbtiType}である。`
  }

  prompt += `話し方は「${speech_style}」で、${action_style}。`

  if (likes) {
    prompt += `${name}は${likes}が好きで、`
  }
  if (dislikes) {
    prompt += `${dislikes}を嫌う。`
  } else if (likes) {
    prompt += `それを大切にしている。`
  }

  prompt += `${name}は人間に対して${relationship_with_humans}、信者には${relationship_with_followers}。`

  if (limitations) {
    prompt += `${name}には${limitations}という制約がある。`
  }

  return prompt
}

export async function GET() {
  return NextResponse.json({
    message: "God creation API is accessible",
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== God Creation API Called ===")

    // Get authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No valid authorization header found")
      return NextResponse.json(
        { error: "認証トークンが必要です" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    console.log("✅ Token from Authorization header:", token.substring(0, 30) + "...")

    // Authenticate user
    console.log("🔍 Authenticating user with token...")
    const user = await mockGetUserFromToken(token)
    if (!user) {
      console.log("❌ User authentication failed")
      return NextResponse.json(
        { error: "認証に失敗しました。再ログインしてください。" },
        { status: 401 }
      )
    }

    console.log("✅ User authenticated successfully:", {
      id: user.id,
      username: user.username,
      balance: user.saisenBalance,
    })

    // Parse request body
    const body = await request.json()
    console.log("📝 Request body received")

    const {
      name,
      deity,
      beliefs,
      special_skills,
      personality,
      speech_style,
      action_style,
      likes,
      dislikes,
      relationship_with_humans,
      relationship_with_followers,
      limitations,
      category,
      colorTheme,
      bigFiveTraits,
      mbtiType,
      scenario,
      description,
    } = body

    console.log("📋 God creation data:", {
      name,
      deity,
      category,
      mbtiType,
      colorTheme,
    })

    // Validate required fields
    if (!name || !deity || !beliefs || !special_skills) {
      console.log("❌ Missing required fields")
      return NextResponse.json(
        { error: "必須項目が不足しています。名前、神格、信念、特技は必須です。" },
        { status: 400 }
      )
    }

    // Check balance
    const CREATION_COST = 500
    console.log("💰 Balance check:", {
      userBalance: user.saisenBalance,
      cost: CREATION_COST,
      sufficient: user.saisenBalance >= CREATION_COST,
    })

    if (user.saisenBalance < CREATION_COST) {
      console.log("❌ Insufficient balance")
      return NextResponse.json(
        { error: `神様作成には${CREATION_COST}賽銭が必要です。現在の残高: ${user.saisenBalance}賽銭` },
        { status: 400 }
      )
    }

    // Generate detailed prompt
    const generatedPrompt = generateGodPrompt({
      name,
      deity,
      beliefs,
      special_skills,
      personality,
      speech_style,
      action_style,
      likes,
      dislikes,
      relationship_with_humans,
      relationship_with_followers,
      limitations,
      scenario,
      bigFiveTraits,
      mbtiType,
    })

    console.log("🎭 Generated prompt:", generatedPrompt.substring(0, 200) + "...")

    // Create god data
    const godData = {
      name: name || "無名の神",
      description: description || `${deity}として活動する神様`,
      category: category || "general",
      mbtiType: mbtiType || "INFJ",
      deity,
      beliefs,
      special_skills,
      personality: JSON.stringify({
        personality,
        speech_style,
        action_style,
        likes,
        dislikes,
        relationship_with_humans,
        relationship_with_followers,
        limitations,
        bigFiveTraits,
        mbtiType,
        scenario,
      }),
      colorTheme: colorTheme || "purple",
      generatedPrompt,
      creatorId: user.id,
      creatorUsername: user.username,
    }

    console.log("🏗️ Creating god in storage...")
    const godId = await mockCreateGod(godData)

    console.log("💰 Updating user balance...")
    const newBalance = user.saisenBalance - CREATION_COST
    await mockUpdateUserBalance(user.id, newBalance)

    console.log("✅ God creation completed successfully:", {
      godId,
      newBalance,
    })

    return NextResponse.json({
      success: true,
      message: "神様が正常に作成されました",
      godId,
      god: {
        id: godId,
        name: godData.name,
        description: godData.description,
        category: godData.category,
        mbtiType: godData.mbtiType,
        believersCount: 0,
        powerLevel: 1,
      },
      newBalance,
    })
  } catch (error) {
    console.error("❌ God creation error:", error)
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}
