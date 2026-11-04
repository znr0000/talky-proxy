export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')

    const q = req.query.q
    if (!q) {
        res.status(400).json({ error: 'missing query' })
        return
    }

    try {
        const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5',
                max_tokens: 500,
                messages: [
                    {
                        role: 'user',
                       content:
    `사용자가 이렇게 말했어: "${q}"\n` +
    `이 사람이 찾고 싶어하는 뜻과 어울리는 한국어 단어를 최대 4개 추천해줘.\n` +
    `이미 정확한 단어(예: "나무", "사랑")를 검색했다면 그 단어 자체와 비슷한 단어들을 추천해줘.\n` +
    `입력은 10대가 일상에서 쓰는 신조어, 줄임말, 속어일 수 있어.\n` +
    `입력이 신조어나 속어로 쓰이는 말이면, 사전적 뜻이나 인명·고유명사보다 일상에서 쓰이는 뜻을 우선해서 해석해줘.\n` +
    `예: "에바"는 성경 인물이 아니라 "지나치다, 무리다"라는 뜻의 신조어야. "레전드"는 "전설"이 아니라 "대단하다, 엄청나다"라는 뜻이야.\n` +
    `추천 단어는 어른과의 대화, 학교, 아르바이트 같은 공식적인 상황에서도 쓸 수 있는 표준어만 넣어줘.\n` +
    `속어, 신조어, 입력한 말 자체나 그 활용형(예: 대박 → 대박이야)은 넣지 마.\n` +
    `참고 예시: 에바 → 무리다, 지나치다, 과하다, 곤란하다 / 레전드 → 대단하다, 굉장하다, 뛰어나다 / 대박 → 굉장하다, 놀랍다, 훌륭하다 / 국룰 → 관례, 불문율, 기본 / 갓생 → 성실하다, 부지런하다, 꾸준하다\n` +
    `각 단어에 대해 품사(pos), 짧은 뜻풀이(definition), 자연스러운 예문(example)을 포함해줘.\n` +
    `뜻풀이는 입력한 말이 쓰인 상황에 맞게 쓰고, 예문은 일상이나 사회생활 문장으로 쓰되 윗사람에게 말하는 존댓말 예문을 포함해줘.\n` +
    `다른 설명 없이 아래 JSON 배열 형식으로만 답해. 코드블록(백틱)도 쓰지 마:\n` +
    `[{"word":"단어","pos":"품사","definition":"뜻풀이","example":"예문"}]`,
                    },
                ],
            }),
        })

        const aiData = await aiRes.json()

        if (aiData.error) {
            res.status(500).json({ error: 'ai error', message: aiData.error.message })
            return
        }

        const raw = aiData.content[0].text
        const cleaned = raw.replace(/```json|```/g, '').trim()
        const items = JSON.parse(cleaned)

        res.status(200).json({ items })
    } catch (e) {
        res.status(500).json({ error: 'ai failed', message: String(e) })
    }
}
