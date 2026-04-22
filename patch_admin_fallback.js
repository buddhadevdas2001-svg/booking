
const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(f => {
      const fp = path.join(dir, f);
      const stat = fs.statSync(fp);
      if (stat.isDirectory()) results = results.concat(walk(fp));
      else if (fp.endsWith('.ts')) results.push(fp);
    });
  } catch (e) { }
  return results;
}

const files = walk('src/app/api/admin');

const ADMIN_IMPORT = `import { createAdminClient } from '@/lib/supabase/admin'`;
const SERVER_IMPORT = `import { createClient as createServerClient } from '@/lib/supabase/server'`;
const SAFE_HELPER = `
// Safe DB client: uses admin client (bypasses RLS) if service role key is set, 
// otherwise falls back to server client (uses RLS with current user session).
async function getDbClient() {
    try {
        return createAdminClient()
    } catch {
        return createServerClient()
    }
}
`;
const SUPABASE_LINE_RE = /const supabase = createAdminClient\(\)/g;
const SUPABASE_REPLACEMENT = `const supabase = await getDbClient()`;

let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes("createAdminClient()")) return;

  if (!content.includes(SERVER_IMPORT)) {
    content = content.replace(ADMIN_IMPORT, `${ADMIN_IMPORT}\n${SERVER_IMPORT}`);
  }


  if (!content.includes('async function getDbClient')) {
    const exportIdx = content.indexOf('\nexport async function');
    if (exportIdx !== -1) {
      content = content.slice(0, exportIdx) + SAFE_HELPER + content.slice(exportIdx);
    }
  }

  content = content.replace(SUPABASE_LINE_RE, SUPABASE_REPLACEMENT);

  fs.writeFileSync(file, content);
  console.log('Patched:', file);
  count++;
});
console.log('Total patched:', count);
