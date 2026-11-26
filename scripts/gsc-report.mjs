import fs from 'node:fs';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] ?? fallback : fallback;
};
const has = (name) => args.includes(`--${name}`);

const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
if (!raw) {
  throw new Error('Set GSC_SERVICE_ACCOUNT_JSON to the service account JSON key');
}

const credentials = JSON.parse(raw);
const tokenUri = credentials.token_uri || 'https://oauth2.googleapis.com/token';
const base64url = (value) => Buffer.from(value).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
const payload = base64url(JSON.stringify({
  iss: credentials.client_email,
  scope: 'https://www.googleapis.com/auth/webmasters',
  aud: tokenUri,
  iat: now,
  exp: now + 3600,
}));
const signingInput = `${header}.${payload}`;
const signature = crypto.createSign('RSA-SHA256').update(signingInput).sign(credentials.private_key).toString('base64url');
const assertion = `${signingInput}.${signature}`;

const tokenResponse = await fetch(tokenUri, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  }),
});
if (!tokenResponse.ok) {
  throw new Error(`Token request failed ${tokenResponse.status}: ${await tokenResponse.text()}`);
}
const { access_token } = await tokenResponse.json();
const auth = {
  Authorization: `Bearer ${access_token}`,
  'Content-Type': 'application/json',
};
const api = 'https://searchconsole.googleapis.com/webmasters/v3';

const sitesResponse = await fetch(`${api}/sites`, { headers: auth });
if (!sitesResponse.ok) {
  throw new Error(`Sites request failed ${sitesResponse.status}: ${await sitesResponse.text()}`);
}
const sites = (await sitesResponse.json()).siteEntry ?? [];
if (has('add-site') && !sites.some((entry) => entry.siteUrl === 'https://chat-iraq.com/')) {
  const addResponse = await fetch(`${api}/sites/${encodeURIComponent('https://chat-iraq.com/')}`, {
    method: 'PUT',
    headers: auth,
    body: '{}',
  });
  sites.push({ siteUrl: 'https://chat-iraq.com/', permissionLevel: addResponse.ok ? 'full' : `http ${addResponse.status}` });
}
const siteUrl = flag('site', process.env.GSC_SITE_URL || sites[0]?.siteUrl);
if (!siteUrl) {
  throw new Error('No Search Console site found; pass --site https://chat-iraq.com/');
}
const encodedSite = encodeURIComponent(siteUrl);
const days = Number(flag('days', '7'));
const dimensions = flag('dimensions', 'query').split(',').map((value) => value.trim()).filter(Boolean);
const limit = Number(flag('limit', '10'));
const endDate = new Date();
const startDate = new Date(endDate.getTime() - days * 86400000);
const formatDate = (date) => date.toISOString().slice(0, 10);

const queryResponse = await fetch(`${api}/sites/${encodedSite}/searchAnalytics/query`, {
  method: 'POST',
  headers: auth,
  body: JSON.stringify({
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    dimensions,
    rowLimit: limit,
  }),
});
if (!queryResponse.ok) {
  throw new Error(`Query request failed ${queryResponse.status}: ${await queryResponse.text()}`);
}

const sitemapsResponse = await fetch(`${api}/sites/${encodedSite}/sitemaps`, { headers: auth });
if (!sitemapsResponse.ok) {
  throw new Error(`Sitemaps request failed ${sitemapsResponse.status}: ${await sitemapsResponse.text()}`);
}

const report = {
  siteUrl,
  period: `${formatDate(startDate)}..${formatDate(endDate)}`,
  dimensions,
  sites: sites.map((entry) => entry.siteUrl),
  rows: (await queryResponse.json()).rows ?? [],
  sitemaps: (await sitemapsResponse.json()).sitemap ?? [],
};

const inspections = [];
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === '--inspect' && args[index + 1]) {
    inspections.push(args[index + 1]);
  }
}
if (inspections.length) {
  const inspectSite = sites.find((entry) => entry.siteUrl === 'https://chat-iraq.com/')?.siteUrl || siteUrl;
  report.inspectSite = inspectSite;
  report.inspections = [];
  for (const inspectionUrl of inspections) {
    const inspectResponse = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({
        inspectionUrl,
        siteUrl: inspectSite,
        languageCode: 'ar',
      }),
    });
    if (!inspectResponse.ok) {
      report.inspections.push({ inspectionUrl, error: `${inspectResponse.status}: ${await inspectResponse.text()}` });
      continue;
    }
    report.inspections.push({ inspectionUrl, result: await inspectResponse.json() });
  }
}

if (has('submit')) {
  report.submitted = [];
  for (const path of ['https://chat-iraq.com/sitemap.xml', 'https://chat-iraq.com/sitemap.txt']) {
    const response = await fetch(`${api}/sites/${encodedSite}/sitemaps/${encodeURIComponent(path)}`, {
      method: 'PUT',
      headers: auth,
    });
    report.submitted.push({ path, status: response.status, ok: response.ok });
  }
}

if (has('prune')) {
  const keep = new Set([
    'https://chat-iraq.com/sitemap.xml',
    'https://chat-iraq.com/sitemap.txt',
  ]);
  report.pruned = [];
  for (const sitemap of report.sitemaps) {
    if (keep.has(sitemap.path)) {
      continue;
    }
    const response = await fetch(`${api}/sites/${encodedSite}/sitemaps/${encodeURIComponent(sitemap.path)}`, {
      method: 'DELETE',
      headers: auth,
    });
    report.pruned.push({ path: sitemap.path, status: response.status, ok: response.ok });
  }
  const refreshed = await fetch(`${api}/sites/${encodedSite}/sitemaps`, { headers: auth });
  if (refreshed.ok) {
    report.sitemaps = (await refreshed.json()).sitemap ?? [];
  }
}

const output = `${JSON.stringify(report, null, 2)}\n`;
const out = flag('out', '');
if (out) {
  fs.writeFileSync(out, output, 'utf8');
  console.log(`GSC report written to ${out}`);
} else {
  console.log(output);
}
