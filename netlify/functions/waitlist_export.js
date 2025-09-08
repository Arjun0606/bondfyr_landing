'use strict';

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

exports.handler = async (event) => {
	try {
		const token = event.queryStringParameters?.token || '';
		const format = (event.queryStringParameters?.format || 'json').toLowerCase();
		if (!token || token !== process.env.EXPORT_TOKEN) {
			return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
		}

		const apiKey = process.env.AIRTABLE_API_KEY;
		const baseId = process.env.AIRTABLE_BASE_ID;
		const table = process.env.AIRTABLE_TABLE_NAME || 'Waitlist';
		if (!apiKey || !baseId) {
			return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Server not configured' }) };
		}

		const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}?pageSize=100`; // simple pagination
		let records = [];
		let next = url;
		while (next) {
			const resp = await fetch(next, { headers: { Authorization: `Bearer ${apiKey}` } });
			if (!resp.ok) {
				const text = await resp.text();
				return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Airtable error', detail: text }) };
			}
			const data = await resp.json();
			records = records.concat(data.records || []);
			next = null; // for simplicity; extend with offset if needed
		}

		const rows = records.map(r => ({
			id: r.id,
			email: r.fields?.Email || '',
			name: r.fields?.Name || '',
			source: r.fields?.Source || '',
			createdTime: r.createdTime,
		}));

		if (format === 'csv') {
			const header = 'id,email,name,source,createdTime';
			const body = rows.map(x => [x.id, x.email, x.name, x.source, x.createdTime].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
			return { statusCode: 200, headers: { 'Content-Type': 'text/csv' }, body: header + '\n' + body };
		}

		return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ count: rows.length, rows }) };
	} catch (e) {
		return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Server error' }) };
	}
};
