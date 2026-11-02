import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, '../supabase/schema.sql');

const projectUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const projectRef = process.env.SUPABASE_PROJECT_REF || (projectUrl ? new URL(projectUrl).hostname.split('.')[0] : undefined);
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!projectUrl) {
  console.log('Supabase project URL not found. Add SUPABASE_URL or VITE_SUPABASE_URL to .env before applying the schema.');
  process.exit(0);
}

const sql = await fs.readFile(schemaPath, 'utf8');

async function runQuery(url, headers, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  if (!response.ok) {
    const details = responseText || 'No response body';
    throw new Error(`Request failed with ${response.status}: ${details}`);
  }

  return responseText;
}

try {
  let responseText;

  if (projectRef && accessToken) {
    const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
    responseText = await runQuery(managementUrl, {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    }, { query: sql });
    console.log('Supabase schema applied successfully via Supabase Management API.');
    process.exit(0);
  }

  if (!serviceRoleKey) {
    console.log('Supabase credentials not found. Add SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF to .env to auto-create the database schema.');
    process.exit(0);
  }

  responseText = await runQuery(`${projectUrl.replace(/\/$/, '')}/rest/v1/sql`, {
    'Content-Type': 'application/json',
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  }, { query: sql });

  console.log('Supabase schema applied successfully via project SQL endpoint.');
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error('Schema upload failed:', detail);
  process.exit(1);
}
