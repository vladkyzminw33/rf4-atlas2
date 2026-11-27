// Забирает новые посты из публичных каналов (веб-версия t.me/s/), ищет в них точки и кладёт кандидатов
// в data/inbox.json. В справочник кандидаты попадают только после проверки человеком (npm run promote).
//   node scripts/fetch-telegram.mjs [--pages 2] [--dry-run]
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { DATA_DIR, readAll, writeJson } from './lib/data-io.mjs';
import { extractSpots, filterNew, parseChannelHtml } from './lib/tg.mjs';

const { values } = parseArgs({ options: { pages: { type: 'string', default: '2' }, 'dry-run': { type: 'boolean', default: false } } });
const pages = Math.min(Math.max(Number(values.pages) || 1, 1), 10);
const readJson = async (name, fallback) => {
  try { return JSON.parse(await readFile(path.join(DATA_DIR, name), 'utf8')); } catch { return fallback; }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const data = await readAll();
const channels = await readJson('channels.json', []);
const state = await readJson('inbox-state.json', {});
let inbox = await readJson('inbox.json', []);
const fishNames = [...new Set(data.spots.map((s) => s.fish?.replace(/\s*\(.*\)/, '').trim()).filter(Boolean))];
const report = [];

for (const ch of channels) {
  if (!(ch.sourceId in data.sources)) { report.push(`${ch.handle}: источник ${ch.sourceId} не описан в sources.json, пропуск`); continue; }
  const lastSeen = state[ch.handle] ?? 0;
  let before = null, maxId = lastSeen, seen = 0, found = [];
  try {
    for (let p = 0; p < pages; p++) {
      const url = `https://t.me/s/${encodeURIComponent(ch.handle)}${before ? `?before=${before}` : ''}`;
      const res = await fetch(url, { headers: { 'user-agent': 'vlad-rr4-atlas/1.0 (+personal non-commercial reference)' }, redirect: 'follow' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const posts = parseChannelHtml(await res.text());
      if (!posts.length) break;
      for (const post of posts) {
        if (post.id <= lastSeen) continue;
        seen++; maxId = Math.max(maxId, post.id);
        found.push(...extractSpots(post, { waters: data.waters, fishNames, sourceId: ch.sourceId }));
      }
      before = Math.min(...posts.map((x) => x.id));
      if (before <= lastSeen) break;
      await sleep(1500);
    }
    const fresh = filterNew(found, [...data.spots, ...inbox]);
    inbox = [...inbox, ...fresh];
    state[ch.handle] = maxId;
    report.push(`${ch.handle}: новых постов ${seen}, кандидатов ${fresh.length}`);
  } catch (error) {
    report.push(`${ch.handle}: ошибка (${error.message}), канал пропущен до следующего запуска`);
  }
  await sleep(1500);
}

console.log(report.join('\n') || 'Каналов в data/channels.json нет.');
if (values['dry-run']) process.exit(0);
await writeJson('inbox.json', inbox);
await writeJson('inbox-state.json', state);
