'use strict';

// Netlify Function: /.netlify/functions/waitlist
// Mapped from /api/waitlist via netlify.toml redirects

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

exports.handler = async (event) => {
	try {
		if (event.httpMethod !== 'POST') {
			return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: '' };
		}

		let payload = {};
		try {
			payload = JSON.parse(event.body || '{}');
		} catch (_) {
			return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON' }) };
		}

		const { email, name, company } = payload || {};

		// Honeypot bot trap
		if (company) {
			return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
		}

		if (!email || !EMAIL_REGEX.test(email)) {
			return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Valid email required' }) };
		}

		const apiKey = process.env.AIRTABLE_API_KEY;
		const baseId = process.env.AIRTABLE_BASE_ID;
		const table = process.env.AIRTABLE_TABLE_NAME || 'Waitlist';

		if (!apiKey || !baseId) {
			return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Server not configured' }) };
		}

		const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;

		const resp = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				records: [
					{
						fields: {
							Email: email,
							Name: name || '',
							Source: 'website',
						},
					},
				],
			}),
		});

		if (!resp.ok) {
			const text = await resp.text();
			return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Airtable error', detail: text }) };
		}

		return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true }) };
	} catch (e) {
		return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Server error' }) };
	}
};
