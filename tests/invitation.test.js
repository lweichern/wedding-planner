import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { chromium } from '@playwright/test';

let server, browser;
const temp = mkdtempSync(join(tmpdir(), 'invitation-test-'));
const database = join(temp, 'responses.sqlite');
const base = 'http://127.0.0.1:3187';
let output = '';
before(async () => {
  server = spawn(process.execPath, ['server.js'], { env: { ...process.env, NODE_ENV: 'production', PORT: '3187', RSVP_DB_PATH: database }, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', chunk => output += chunk);
  server.stderr.on('data', chunk => output += chunk);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(output || 'Server startup timed out')), 12000);
    const poll = setInterval(async () => {
      try { const res = await fetch(base); if (res.ok) { clearInterval(poll); clearTimeout(timer); resolve(); } } catch {}
    }, 100);
    server.once('exit', code => { clearInterval(poll); clearTimeout(timer); reject(new Error(`Server exited ${code}: ${output}`)); });
  });
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
});
after(async () => { await browser?.close(); if (server?.exitCode === null) { const exited = new Promise(resolve => server.once('exit', resolve)); server.kill('SIGTERM'); await exited; } rmSync(temp, { recursive: true, force: true }); });
const submit = body => fetch(`${base}/api/rsvp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const valid = { name: 'Test Guest', email: 'test@example.com', attending: 'yes', guests: '2', shuttle: 'yes', dietary: 'One vegetarian', message: 'Congratulations!' };

test('RSVP API validates required data and persists responses to SQLite', async () => {
  assert.equal((await submit({})).status, 400);
  assert.equal((await submit({ ...valid, email: 'invalid' })).status, 400);
  assert.equal((await submit({ ...valid, guests: 8 })).status, 400);
  assert.equal((await submit({ ...valid, shuttle: '' })).status, 400);
  const response = await submit(valid); assert.equal(response.status, 200);
  const data = await response.json(); assert.ok(data.id);
  const db = new DatabaseSync(database, { readOnly: true });
  const saved = db.prepare('SELECT * FROM responses WHERE email = ?').get(valid.email);
  assert.equal(saved.guests, 2); assert.equal(saved.dietary, valid.dietary); db.close();
  assert.equal((await submit({ ...valid, attending: 'no' })).status, 409);
  assert.equal((await submit({ ...valid, attending: 'no', responseId: data.id })).status, 200);
  const db2 = new DatabaseSync(database, { readOnly: true });
  const updated = db2.prepare('SELECT * FROM responses WHERE email = ?').get(valid.email);
  assert.equal(updated.attending, 'no'); assert.equal(updated.guests, 0); assert.equal(updated.dietary, ''); db2.close();
});

test('mobile and desktop layouts load their assets with no horizontal overflow or script errors', async () => {
  const page = await browser.newPage(); const errors = []; const failed = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('requestfailed', req => failed.push(req.url()));
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('h1').textContent(), 'Camille & Antoine');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow at ${width}px`);
    await page.locator('#celebration').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.images].filter(i => !i.closest('[hidden]')).every(i => i.complete && i.naturalWidth > 0));
    assert.equal(await page.evaluate(() => [...document.fonts].some(f => f.family.includes('Cormorant') && f.status === 'loaded')), true);
  }
  assert.deepEqual(errors, []); assert.deepEqual(failed, []);
  await page.close();
});

test('opening animation can be skipped with Escape and replayed to completion', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(base);
  await page.locator('.open-invitation').click();
  assert.equal(await page.locator('.opening-scene').isVisible(), true);
  assert.equal(await page.locator('main').evaluate(el => el.inert), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.opening-scene').isVisible(), false);
  assert.equal(await page.locator('main').evaluate(el => el.inert), false);
  await page.locator('.replay-invitation').click();
  await page.waitForSelector('.opening-scene.curtains-open');
  await page.waitForSelector('.opening-scene[hidden]', { state: 'attached' });
  assert.equal(await page.evaluate(() => document.body.classList.contains('opening-active')), false);
  await page.close();
});

test('RSVP form accepts, restores, and edits a response on mobile', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(base);
  await page.locator('header a[href="#rsvp"]').click();
  await page.locator('#guest-name').fill('Alex Sample');
  await page.locator('#guest-email').fill('alex@example.com');
  await page.locator('label.radio-card').first().click();
  assert.equal(await page.locator('#attending-fields').isVisible(), true);
  await page.locator('#guest-count').selectOption('2');
  await page.locator('#shuttle').selectOption('yes');
  await page.locator('#dietary').fill('Alex is vegetarian');
  await page.locator('#message').fill('Cannot wait to celebrate.');
  await page.locator('.submit-button').click();
  await page.waitForSelector('.rsvp-success:not([hidden])');
  assert.equal(await page.locator('#success-title').textContent(), 'We saved you a seat.');
  await page.reload();
  assert.equal(await page.locator('.rsvp-success').isVisible(), true);
  await page.locator('.edit-response').click();
  assert.equal(await page.locator('#guest-name').inputValue(), 'Alex Sample');
  await page.locator('label.radio-card').last().click();
  assert.equal(await page.locator('#attending-fields').isVisible(), false);
  await page.locator('.submit-button').click();
  await page.waitForSelector('.rsvp-success:not([hidden])');
  assert.equal(await page.locator('#success-title').textContent(), 'You’ll be there in spirit.');
  assert.equal(await page.locator('.rsvp-success .calendar-action').isVisible(), false);
  await page.close();
});

test('RSVP connection failure keeps answers and presents an actionable error', async () => {
  const page = await browser.newPage(); await page.goto(base);
  await page.route('**/api/rsvp', route => route.abort());
  await page.locator('#guest-name').fill('Guest Offline');
  await page.locator('#guest-email').fill('offline@example.com');
  await page.locator('label.radio-card').last().click();
  await page.locator('.submit-button').click();
  await page.waitForSelector('.form-error:not([hidden])');
  assert.match(await page.locator('.form-error').textContent(), /couldn’t connect/);
  assert.equal(await page.locator('#guest-name').inputValue(), 'Guest Offline');
  assert.equal(await page.locator('.submit-button').isEnabled(), true);
  await page.close();
});

test('calendar export uses the venue timezone and FAQ expands', async () => {
  const page = await browser.newPage(); await page.goto(base);
  const downloaded = page.waitForEvent('download'); await page.locator('.event-links .calendar-action').click();
  const download = await downloaded; const path = await download.path(); const data = readFileSync(path, 'utf8');
  assert.match(data, /DTSTART:20270612T150000Z/); assert.match(data, /DTEND:20270612T210000Z/);
  assert.match(data, /SUMMARY:Camille & Antoine/); assert.match(data, /Château de Santenay/);
  await page.locator('.faq summary').nth(1).click();
  assert.equal(await page.locator('.faq details').nth(1).getAttribute('open'), '');
  assert.match(await page.locator('.faq details').nth(1).textContent(), /shuttle/);
  await page.close();
});

test('reduced motion bypasses the theatrical animation', async () => {
  const page = await browser.newPage({ reducedMotion: 'reduce' }); await page.goto(base);
  await page.locator('.open-invitation').click();
  assert.equal(await page.locator('.opening-scene').isVisible(), false);
  assert.equal(await page.locator('main').evaluate(el => el.inert), false);
  await page.close();
});
