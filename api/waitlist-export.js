'use strict';

import { list } from '@vercel/blob';

export default async function handler(req, res) {
	if (req.method !== 'GET') return res.status(405).end();
	const token = (req.query?.token || '').toString();
	const format = (req.query?.format || 'json').toString().toLowerCase();
	if (!token || token !== process.env.EXPORT_TOKEN) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	try {
		const all = await list({ prefix: 'waitlist/' });
		const rows = [];
		for (const item of all.blobs || []) {
			const resp = await fetch(item.url);
			if (!resp.ok) continue;
			const json = await resp.json();
			rows.push(json);
		}
		if (format === 'csv') {
			const header = 'id,email,name,source,createdTime';
			const body = rows.map(x => [x.id, x.email, x.name, x.source, x.createdTime].map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
			res.setHeader('Content-Type', 'text/csv');
			return res.status(200).send(header + '\n' + body);
		}
		return res.status(200).json({ count: rows.length, rows });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
}
