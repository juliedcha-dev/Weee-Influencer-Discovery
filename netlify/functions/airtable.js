const AT_TOKEN = process.env.AIRTABLE_TOKEN;
const AT_BASE  = process.env.AIRTABLE_BASE;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
};

exports.handler = async function(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  const table  = event.queryStringParameters?.table || 'Creators';
  const method = event.httpMethod;
  const offset = event.queryStringParameters?.offset || '';

  let url = `https://api.airtable.com/v0/${AT_BASE}/${encodeURIComponent(table)}`;
  if (method === 'GET' && offset) url += `?offset=${offset}`;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${AT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: method !== 'GET' ? event.body : undefined
    });

    const data = await res.json();

    return {
      statusCode: res.status,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Airtable request failed' })
    };
  }
};
