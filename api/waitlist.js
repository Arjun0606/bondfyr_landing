'use strict';

export default async function handler(req, res) {
	if (req.method !== 'POST') return res.status(405).end();
	const { email, name, company } = req.body || {};
	if (company) return res.status(200).json({ ok: true });
	if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
		return res.status(400).json({ error: 'Valid email required' });
	}
	try {
		const apiKey = process.env.AIRTABLE_API_KEY;
		const baseId = process.env.AIRTABLE_BASE_ID;
		const table = process.env.AIRTABLE_TABLE_NAME || 'Waitlist';
		if (!apiKey || !baseId) {
			return res.status(500).json({ error: 'Server not configured' });
		}
		const resp = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({ records: [{ fields: { Email: email, Name: name || '', Source: 'website' } }] })
		});
		if (!resp.ok) {
			const text = await resp.text();
			return res.status(500).json({ error: 'Airtable error', detail: text });
		}
		return res.status(200).json({ ok: true });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
}
