export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')

    const q = req.query.q
    if (!q) {
        res.status(400).json({ error: 'missing query' })
        return
    }

    const url =
        'https://stdict.korean.go.kr/api/search.do?key=' +
        process.env.STDICT_KEY +
        '&q=' +
        encodeURIComponent(q) +
        '&req_type=json&num=5'

    try {
        const r = await fetch(url)
        const data = await r.json()
        res.status(200).json(data)
    } catch (e) {
        res.status(500).json({ error: 'proxy failed', message: String(e) })
    }
}
