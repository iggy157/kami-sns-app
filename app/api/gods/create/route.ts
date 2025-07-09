import { type NextRequest, NextResponse } from "next/server"
import { mockGetUserFromToken, mockUpdateUserBalance, mockCreateGod, getActiveTokens } from "@/lib/mock-auth"

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
  const activeTokens = getActiveTokens()
  return NextResponse.json({
    message: "God creation API is accessible",
    timestamp: new Date().toISOString(),
    activeTokensCount: Object.keys(activeTokens).length,
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== Detailed God Creation API Called ===")

    // Get authorization header with multiple fallback methods
    const authHeader = request.headers.get("authorization")
    let token = ""

    if (authHeader) {
      token = authHeader.replace("Bearer ", "")
      console.log("✅ Token from Authorization header:", token.substring(0, 30) + "...")
    } else {
      // Fallback: try to get token from request body or cookies
      try {
        const body = await request.json()
        if (body.token) {
          token = body.token
          console.log("✅ Token from request body:", token.substring(0, 30) + "...")
        }
      } catch (error) {
        console.log("❌ No token in request body")
      }

      // If still no token, try cookies
      if (!token) {
        const cookies = request.headers.get("cookie")
        if (cookies) {
          const tokenMatch = cookies.match(/auth-token=([^;]+)/)
          if (tokenMatch) {
            token = tokenMatch[1]
            console.log("✅ Token from cookies:", token.substring(0, 30) + "...")
          }
        }
      }
    }

    if (!token) {
      console.log("❌ No authentication token found")
      return NextResponse.json(
        {
          error: "認証トークンが必要です",
          details: "Authorization header, request body, or cookies must contain a valid token",
        },
        { status: 401 },
      )
    }

    // Authenticate user with enhanced error handling
    console.log("🔍 Authenticating user with token...")
    const user = await mockGetUserFromToken(token)
    if (!user) {
      console.log("❌ User authentication failed")
      return NextResponse.json(
        {
          error: "認証に失敗しました。再ログインしてください。",
          details: "Token validation failed",
        },
        { status: 401 },
      )
    }

    console.log("✅ User authenticated successfully:", {
      id: user.id,
      username: user.username,
      balance: user.saisenBalance,
    })

    // Parse request body (re-read if already consumed)
    let body
    try {
      // If we already read the body for token extraction, we need to handle this differently
      if (authHeader) {
        body = await request.json()
      } else {
        // Body was already read, so we need to reconstruct it or handle differently
        // For now, let's assume the body is available
        const requestText = await request.text()
        body = JSON.parse(requestText)
      }
      console.log("📝 Request body parsed successfully")
    } catch (error) {
      console.log("❌ Failed to parse request body:", error)
      return NextResponse.json({ error: "リクエストボディの解析に失敗しました" }, { status: 400 })
    }

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
      hasPersonality: !!personality,
      hasBigFive: !!bigFiveTraits,
    })

    // Validate required fields
    if (!name || !deity || !beliefs || !special_skills) {
      console.log("❌ Missing required fields")
      return NextResponse.json(
        { error: "必須項目が不足しています。名前、神格、信念、特技は必須です。" },
        { status: 400 },
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
        { status: 400 },
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

    // Create god with detailed data
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
        colorTheme,
        generatedPrompt,
      }),
      creatorId: user.id,
      believersCount: 0,
      powerLevel: 1,
      colorTheme,
      prompt: generatedPrompt,
      ...body,
    }

    const godId = await mockCreateGod(godData)
    console.log("✅ God created successfully:", godId)

    // Update balance
    const newBalance = user.saisenBalance - CREATION_COST
    const balanceUpdated = await mockUpdateUserBalance(user.id, newBalance)
    if (!balanceUpdated) {
      console.log("⚠️ Failed to update balance, but god was created")
    } else {
      console.log("✅ Balance updated successfully:", newBalance)
    }

    const response = {
      message: "詳細な神様が正常に作成されました！",
      godId: godId,
      newBalance: newBalance,
      god: {
        id: godId,
        ...godData,
        createdAt: new Date().toISOString(),
      },
      prompt: generatedPrompt,
    }

    console.log("🎉 God creation completed successfully")
    return NextResponse.json(response)
  } catch (error) {
    console.error("💥 God creation API error:", error)
    return NextResponse.json(
      {
        error: "サーバーエラーが発生しました",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
