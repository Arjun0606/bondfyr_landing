'use strict';

export default async function handler(req, res) {
	if (req.method !== 'GET') return res.status(405).end();
	const token = (req.query?.token || '').toString();
	const format = (req.query?.format || 'json').toString().toLowerCase();
	if (!token || token !== process.env.EXPORT_TOKEN) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	const apiKey = process.env.AIRTABLE_API_KEY;
	const baseId = process.env.AIRTABLE_BASE_ID;
	const table = process.env.AIRTABLE_TABLE_NAME || 'Waitlist';
	if (!apiKey || !baseId) {
		return res.status(500).json({ error: 'Server not configured' });
	}
	try {
		const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}?pageSize=100`;
		let records = [];
		let next = url;
		while (next) {
			const resp = await fetch(next, { headers: { Authorization: `Bearer ${apiKey}` } });
			if (!resp.ok) {
				const text = await resp.text();
				return res.status(500).json({ error: 'Airtable error', detail: text });
			}
			const data = await resp.json();
			records = records.concat(data.records || []);
			next = null; // extend with pagination if needed
		}
		const rows = records.map(r => ({ id: r.id, email: r.fields?.Email || '', name: r.fields?.Name || '', source: r.fields?.Source || '', createdTime: r.createdTime }));
		if (format === 'csv') {
			const header = 'id,email,name,source,createdTime';
			const body = rows.map(x => [x.id, x.email, x.name, x.source, x.createdTime].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
			res.setHeader('Content-Type', 'text/csv');
			return res.status(200).send(header + '\n' + body);
		}
		return res.status(200).json({ count: rows.length, rows });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
}
