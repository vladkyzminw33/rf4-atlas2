import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSpots, filterNew, parseChannelHtml } from '../scripts/lib/tg.mjs';

const html = `<div class="tgme_widget_message_wrap js-widget_message_wrap"><div class="tgme_widget_message" data-post="rf4places/101">
<div class="tgme_widget_message_text js-message_text" dir="auto">Старый острог, Карп трофей<br>Координаты: 21:67<br>Наживка: кукуруза &amp; бойл 20 мм</div>
<a class="tgme_widget_message_date"><time datetime="2026-11-20T10:00:00+00:00" class="time">10:00</time></a></div></div>
<div class="tgme_widget_message_wrap"><div class="tgme_widget_message" data-post="rf4places/102">
<div class="tgme_widget_message_text" dir="auto">Стрим сегодня в 21:30 на Старом остроге, приходите</div></div></div>
<div class="tgme_widget_message_wrap"><div class="tgme_widget_message" data-post="rf4places/103"><div class="tgme_widget_message_photo"></div></div></div>`;

const ctx = { waters: [{ id: 'staryy-ostrog', name: 'Старый острог' }, { id: 'komarinoe', name: 'Комариное' }], fishNames: ['Карп', 'Щука'], sourceId: 'tg-rf4places' };

test('parseChannelHtml достаёт id, ссылку, дату и текст, пропускает посты без текста', () => {
  const posts = parseChannelHtml(html);
  assert.equal(posts.length, 2);
  assert.equal(posts[0].url, 'https://t.me/rf4places/101');
  assert.equal(posts[0].date, '2026-11-20T10:00:00+00:00');
  assert.match(posts[0].text, /кукуруза & бойл/);
});
test('extractSpots берёт координату рядом со словом «координаты», а время не путает с точкой', () => {
  const [a, b] = parseChannelHtml(html);
  const spots = extractSpots(a, ctx);
  assert.equal(spots.length, 1);
  assert.deepEqual([spots[0].water, spots[0].fish, spots[0].coord, spots[0].verified], ['staryy-ostrog', 'Карп', '21:67', false]);
  assert.equal(spots[0].bait, 'кукуруза & бойл 20 мм');
  assert.equal(spots[0].post, 'https://t.me/rf4places/101');
  assert.deepEqual(extractSpots(b, ctx), []);
});
test('падежи названия водоёма распознаются', () => {
  const post = { id: 1, url: 'https://t.me/x/1', text: 'На Старом остроге карп, точка 10:44' };
  assert.equal(extractSpots(post, ctx)[0]?.water, 'staryy-ostrog');
});
test('filterNew убирает уже известные точки и повторы', () => {
  const [a] = parseChannelHtml(html);
  const c = extractSpots(a, ctx);
  assert.equal(filterNew([...c, ...c], []).length, 1);
  assert.equal(filterNew(c, [{ ...c[0], id: 'other' }]).length, 0);
});
