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
                            `각 단어에 대해 품사(pos), 짧은 뜻풀이(definition), 자연스러운 예문(example)을 포함해줘.\n` +
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
