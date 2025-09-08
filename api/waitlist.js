'use strict';

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
	if (req.method !== 'POST') return res.status(405).end();
	const { email, name, company } = req.body || {};
	if (company) return res.status(200).json({ ok: true });
	if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
		return res.status(400).json({ error: 'Valid email required' });
	}
	try {
		const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const entry = { id, email, name: name || '', source: 'website', createdTime: new Date().toISOString() };
		// Store by ID and also push to a list for quick export
		await kv.hset(`waitlist:${id}`, entry);
		await kv.lpush('waitlist:index', id);
		return res.status(200).json({ ok: true });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
}
