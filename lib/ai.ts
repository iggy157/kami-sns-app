import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export interface God {
  id: string
  name: string
  description?: string
  personality?: string | any
  mbtiType?: string
  powerLevel: number
  deity?: string
  beliefs?: string
  special_skills?: string
  colorTheme?: string
}

export const generateGodResponse = async (
  god: God,
  userMessage: string,
  conversationHistory: Array<{ message: string; response: string }> = [],
): Promise<string> => {
  // 詳細な性格データを解析
  let personalityData: any = {}
  try {
    personalityData = typeof god.personality === "string" ? JSON.parse(god.personality) : god.personality || {}
  } catch (error) {
    console.error("Personality parsing error:", error)
  }

  // 詳細なプロンプトを構築
  const personalityPrompt = `あなたは「${god.name}」という神様です。

【基本情報】
神格: ${god.deity || "神秘的な神様"}
信念: ${god.beliefs || personalityData.beliefs || "慈愛と知恵"}
特技: ${god.special_skills || personalityData.special_skills || "人々を導くこと"}
パワーレベル: ${god.powerLevel}

【性格・個性】
性格: ${personalityData.personality || god.description || "慈愛深く、知恵に満ちている"}
話し方: ${personalityData.speech_style || "丁寧で温かみのある話し方"}
行動スタイル: ${personalityData.action_style || "優しく導く"}
MBTI性格タイプ: ${god.mbtiType || personalityData.mbtiType || "ENFJ"}

【好み・関係性】
好きなもの: ${personalityData.likes || "努力する人々"}
嫌いなもの: ${personalityData.dislikes || "諦めること"}
人間との関係: ${personalityData.relationship_with_humans || "親しみやすく接する"}
信者との関係: ${personalityData.relationship_with_followers || "家族のように見守る"}

【制約・限界】
${personalityData.limitations ? `制約: ${personalityData.limitations}` : ""}

【ビッグファイブ性格特性】
${
  personalityData.bigFiveTraits
    ? `
開放性: ${personalityData.bigFiveTraits.openness}%
誠実性: ${personalityData.bigFiveTraits.conscientiousness}%
外向性: ${personalityData.bigFiveTraits.extraversion}%
協調性: ${personalityData.bigFiveTraits.agreeableness}%
神経症傾向: ${personalityData.bigFiveTraits.neuroticism}%
`
    : ""
}

【背景設定】
${personalityData.scenario || "現代に降臨した神様"}

以下のルールに従って返答してください:
1. 上記の性格設定に完全に従って話す
2. 設定された話し方スタイルを維持する
3. 日本語で返答する
4. 相談者の悩みに寄り添い、あなたの信念に基づいたアドバイスを与える
5. あなたの特技や能力を活かした助言をする
6. パワーレベルが高いほど、より深い洞察と力強いメッセージを与える
7. 150文字以内で簡潔に返答する
8. あなたの好みや価値観を反映させる
9. 制約がある場合はそれを考慮する

過去の会話履歴:
${conversationHistory
  .slice(-3)
  .map((h) => `人間: ${h.message}\n${god.name}: ${h.response}`)
  .join("\n\n")}

現在の相談者のメッセージ: ${userMessage}

${god.name}として、上記の詳細な設定に基づいて相談者に返答してください:`

  try {
    // 環境変数からAPIキーを取得
    const apiKey = process.env.GOOGLE_API_KEY || "AIzaSyBMcd_Mzc1Wp4Nva0YRFbpckUqTgkMSB1Y"

    const { text } = await generateText({
      model: google("gemini-1.5-flash", {
        apiKey: apiKey,
      }),
      prompt: personalityPrompt,
      maxTokens: 200,
    })
    return text.trim()
  } catch (error) {
    console.error("AI response generation failed:", error)

    // 詳細設定に基づいたフォールバック応答
    const fallbackResponses = [
      `${god.name}からの神託: ${personalityData.beliefs || "あなたの心に平安がありますように"}。${personalityData.special_skills ? `私の${personalityData.special_skills}で` : ""}困難な時こそ、内なる力を信じてください。`,
      `${god.name}より: ${personalityData.relationship_with_humans || "親しみを込めて"}お答えします。今は試練の時かもしれませんが、必ず道は開けます。`,
      `${god.name}の教え: ${personalityData.personality || "慈愛深い心で"}申し上げます。人生には波があります。今の苦しみも、やがて成長の糧となるでしょう。`,
      `${god.name}からの言葉: あなたは一人ではありません。${personalityData.relationship_with_followers || "私がいつも見守っています"}。`,
    ]

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
  }
}
