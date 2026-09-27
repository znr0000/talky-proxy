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
                max_tokens: 300,
                messages: [
                    {
                        role: 'user',
                        content:
                            `"${q}"라는 한국어 단어의 정확한 뜻을 알려줘.\n` +
                            `품사(pos), 뜻풀이(definition), 자연스러운 예문(example)을 포함해줘.\n` +
                            `만약 실제로 존재하지 않는 단어라면 definition에 "존재하지 않는 단어예요"라고 써줘.\n` +
                            `다른 설명 없이 아래 JSON 형식으로만 답해. 코드블록(백틱)도 쓰지 마:\n` +
                            `{"word":"${q}","pos":"품사","definition":"뜻풀이","example":"예문"}`,
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
        const item = JSON.parse(cleaned)

        res.status(200).json({ item })
    } catch (e) {
        res.status(500).json({ error: 'ai failed', message: String(e) })
    }
}
