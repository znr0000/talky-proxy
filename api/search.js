export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')

    const q = req.query.q
    if (!q) {
        res.status(400).json({ error: 'missing query' })
        return
    }

    const key = process.env.STDICT_KEY

    const url =
        'https://stdict.korean.go.kr/api/search.do?key=' +
        key +
        '&q=' +
        encodeURIComponent(q) +
        '&req_type=json&num=5'

    try {
        const r = await fetch(url)
        const text = await r.text()
        res.status(200).json({
            keyLength: key ? key.length : 0,
            keyPreview: key ? key.slice(0, 4) + '...' : 'EMPTY',
            debugUrl: url,
            rawResponse: text,
        })
    } catch (e) {
        res.status(500).json({ error: 'proxy failed', message: String(e) })
    }
}
