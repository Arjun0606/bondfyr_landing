'use strict';

import { put } from '@vercel/blob';

export default async function handler(req, res) {
	try {
		if (req.method !== 'POST') return res.status(405).end();

		if (!process.env.BLOB_READ_WRITE_TOKEN) {
			console.error('BLOB_READ_WRITE_TOKEN missing. Is the Blob store linked to this project?');
			return res.status(500).json({ error: 'Blob store not linked' });
		}

		let email = '', name = '', company = '';
		try {
			if (typeof req.body === 'string') {
				({ email = '', name = '', company = '' } = JSON.parse(req.body || '{}'));
			} else if (req.body) {
				({ email = '', name = '', company = '' } = req.body);
			}
		} catch (parseErr) {
			console.error('Invalid JSON body', parseErr);
			return res.status(400).json({ error: 'Invalid JSON' });
		}

		if (company) return res.status(200).json({ ok: true });
		if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
			return res.status(400).json({ error: 'Valid email required' });
		}

		const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const entry = { id, email, name: name || '', source: 'website', createdTime: new Date().toISOString() };
		await put(`waitlist/${id}.json`, JSON.stringify(entry), { access: 'private', contentType: 'application/json' });
		return res.status(200).json({ ok: true });
	} catch (e) {
		console.error('waitlist API error', e);
		return res.status(500).json({ error: 'Server error' });
	}
}
