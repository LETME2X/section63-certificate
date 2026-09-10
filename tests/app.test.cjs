const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync, mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { createHash, webcrypto } = require('node:crypto');
const { JSDOM } = require('jsdom');
const root = path.join(__dirname, '..');
const html = readFileSync(path.join(root, 'index.html'), 'utf8');
const controller = readFileSync(path.join(root, 'app.js'), 'utf8');
const core = html.match(/<script id="core">([\s\S]*?)<\/script>/)?.[1];
const tick = () => new Promise(resolve => setTimeout(resolve, 15));
async function settled(check) {
  for (let i = 0; i < 150; i++) { if (check()) return; await tick(); }
  assert.fail('UI did not settle');
}
function setup(t, digest) {
  assert.ok(core, 'core script must be closed');
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'http://localhost:3063/' });
  const w = dom.window, alerts = [], downloads = [], blobs = [], copied = [];
  w.TextEncoder = TextEncoder;
  Object.defineProperty(w.crypto, 'subtle', { value: { digest: digest || ((algo, bytes) => webcrypto.subtle.digest(algo, Buffer.from(bytes))) } });
  w.alert = text => alerts.push(text); w.confirm = () => true;
  w.URL.createObjectURL = blob => { blobs.push(blob); return 'blob:test'; };
  w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = function () { downloads.push(this.download); };
  Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: async text => copied.push(text) } });
  w.eval(core); w.eval(controller);
  t.after(() => w.close());
  const $ = id => w.document.getElementById(id);
  const change = (id, value, event = 'change') => { $(id).value = value; $(id).dispatchEvent(new w.Event(event, { bubbles: true })); };
  const file = (name, content = 'abc', delay = 0) => ({ name, size: Buffer.byteLength(content), arrayBuffer: async () => {
    if (delay) await new Promise(resolve => setTimeout(resolve, delay));
    return Uint8Array.from(Buffer.from(content)).buffer;
  } });
  const drop = (id, items) => {
    const e = new w.Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(e, 'dataTransfer', { value: { files: items, types: ['Files'] } });
    $(id).dispatchEvent(e); assert.ok(e.defaultPrevented);
  };
  return { w, $, change, file, drop, alerts, downloads, blobs, copied };
}

test('HTML scripts and local links are complete, including explainer anchors', () => {
  assert.ok(core); assert.match(html, /<script src="app.js"><\/script>/);
  assert.match(html, /<\/body>\s*<\/html>/);
  for (const file of ['index.html', 'explainer.html']) {
    const doc = new JSDOM(readFileSync(path.join(root, file), 'utf8')).window.document;
    for (const a of doc.querySelectorAll('a[href]')) {
      const href = a.getAttribute('href');
      if (/^https?:/.test(href)) continue;
      const [target, anchor] = href.split('#');
      const targetFile = path.join(root, target || file);
      assert.ok(existsSync(targetFile), href);
      if (anchor) assert.ok(new JSDOM(readFileSync(targetFile, 'utf8')).window.document.getElementById(anchor), href);
    }
  }
  assert.ok(!html.includes('nic.in/bitstream/'));
});

test('SHA256, SHA1 and MD5 match independent known digests, including empty/binary input', async t => {
  const { w } = setup(t);
  for (const content of [Buffer.alloc(0), Buffer.from('abc'), Buffer.from('हिन्दी & <record>'), Buffer.from(Array.from({ length: 257 }, (_, i) => i % 256))]) {
    for (const algo of ['SHA256', 'SHA1', 'MD5']) {
      assert.equal(await w.hashBytes(new w.Uint8Array(content), algo), createHash(algo.toLowerCase()).update(content).digest('hex'));
    }
  }
});

test('Hindi/English switches all working labels without erasing form or changing document language', t => {
  const { w, $, change } = setup(t);
  change('aName', 'Test Advocate', 'input'); change('docLang', 'hi');
  $('uiHi').click();
  assert.equal(w.document.documentElement.lang, 'hi');
  assert.equal($('uiHi').getAttribute('aria-pressed'), 'true');
  for (const el of w.document.querySelectorAll('[data-i18n]')) {
    assert.match(el.textContent, /[\u0900-\u097f]/, el.dataset.i18n);
    assert.ok(!el.textContent.includes('undefined'));
  }
  assert.match(w.document.querySelector('[data-i18n="explainerLink"] a').href, /explainer.html#hi$/);
  $('uiEn').click();
  assert.equal($('aName').value, 'Test Advocate'); assert.equal($('docLang').value, 'hi');
  assert.equal(w.document.querySelector('.statute').getAttribute('lang'), 'hi');
  assert.equal($('genCert').textContent, 'Download certificate (.docx)');
  change('docLang', 'en'); assert.match(w.document.querySelector('.statute').textContent, /I state/);
});

test('picker, drop, copy, removal and recomputation work without treating filenames as markup', async t => {
  const { w, $, drop, file, change, copied } = setup(t);
  const name = '<img src=x onerror=alert(1)>.txt';
  drop('drop', [file(name), file('empty.txt', '')]);
  assert.ok($('genCert').disabled);
  await settled(() => !$('genCert').disabled);
  assert.equal($('fileList').querySelectorAll('.record').length, 2);
  assert.equal($('fileList').querySelectorAll('img').length, 0);
  $('fileList').querySelector('[data-copy="0"]').click(); await tick();
  assert.equal(copied[0], createHash('sha256').update('abc').digest('hex'));
  change('algo', 'MD5'); await settled(() => !$('genCert').disabled);
  assert.equal($('fileList').querySelector('.hashval').textContent, '900150983cd24fb0d6963f7d28e17f72');
  $('fileList').querySelector('[data-remove="0"]').click();
  assert.equal($('fileList').querySelectorAll('.record').length, 1);
  Object.defineProperty($('fileInput'), 'files', { value: [file('picker.txt')], configurable: true });
  $('fileInput').dispatchEvent(new w.Event('change'));
  await settled(() => !$('genCert').disabled);
  assert.equal($('fileList').querySelectorAll('.record').length, 2);
  assert.equal($('fileInput').value, '');
});

test('an old slow algorithm cannot overwrite a newer hash', async t => {
  const { $, drop, file, change } = setup(t, async (algo, bytes) => {
    if (algo === 'SHA-256') await new Promise(r => setTimeout(r, 70));
    return webcrypto.subtle.digest(algo, Buffer.from(bytes));
  });
  drop('drop', [file('sample.txt')]); await tick();
  change('algo', 'SHA1'); change('algo', 'MD5');
  await settled(() => !$('genCert').disabled);
  await new Promise(r => setTimeout(r, 90));
  assert.equal($('fileList').querySelector('.hashval').textContent, createHash('md5').update('abc').digest('hex'));
});

test('verification handles all algorithms, formatted hashes, invalid characters and mismatches', async t => {
  const { $, drop, file, change } = setup(t);
  drop('vDrop', [file('verify.txt')]); await tick();
  for (const algo of ['sha256', 'sha1', 'md5']) {
    const hex = createHash(algo).update('abc').digest('hex');
    change('statedHash', hex.toUpperCase().match(/.{1,8}/g).join(' '), 'input');
    await settled(() => $('vResult').querySelector('.verdict'));
    assert.equal($('vResult').querySelector('.verdict').textContent, 'Match.');
  }
  change('statedHash', '0'.repeat(64), 'input');
  await settled(() => $('vResult').querySelector('.verdict'));
  assert.equal($('vResult').querySelector('.verdict').textContent, 'No match.');
  change('statedHash', 'z' + '0'.repeat(64), 'input'); assert.match($('vResult').textContent, /not a recognisable/);
  $('uiHi').click(); assert.match($('vResult').textContent, /पहचान योग्य/);
  drop('vDrop', [file('a'), file('b')]); assert.match($('vResult').textContent, /एक बार में एक/);
});

test('clear cancels pending reads and verification; cancelling clear preserves data', async t => {
  const { w, $, drop, file, change } = setup(t);
  change('aName', 'Keep me', 'input'); w.confirm = () => false; $('clearAll').click(); assert.equal($('aName').value, 'Keep me');
  w.confirm = () => true;
  drop('drop', [file('slow.txt', 'abc', 70)]);
  drop('vDrop', [file('slow-verify.txt', 'abc', 70)]);
  $('clearAll').click();
  await new Promise(r => setTimeout(r, 100));
  assert.equal($('fileList').textContent, ''); assert.equal($('vResult').textContent, ''); assert.equal($('aName').value, '');
  assert.ok(!$('genCert').disabled); assert.match($('aDate').value, /^\d{2}\/\d{2}\/\d{4}$/);
});

test('read/hash failures are visible and incomplete hashes cannot be exported', async t => {
  const { $, drop, file, alerts } = setup(t, async () => { throw new Error('Unavailable'); });
  drop('drop', [file('failed.txt')]);
  await settled(() => $('fileList').textContent.includes('Could not read or hash'));
  assert.ok($('genCert').disabled);
  $('fileList').querySelector('[data-remove]').click(); assert.ok(!$('genCert').disabled);
  drop('drop', [{ name: 'unreadable.txt', arrayBuffer: async () => { throw new Error('Read failed'); } }]);
  await settled(() => alerts.length === 1); assert.match(alerts[0], /Could not read/);
});

test('certificate and report downloads contain exact hashes and independent A/B fields in both languages', async t => {
  const { w, $, drop, file, change, downloads, blobs } = setup(t);
  drop('drop', [file('synthetic-evidence.txt')]); await settled(() => !$('genCert').disabled);
  change('aName', 'Test <Party> & Co', 'input'); change('bName', 'Independent Expert', 'input');
  for (const lang of ['en', 'hi']) {
    change('docLang', lang);
    $('genCert').click(); $('genReport').click();
    assert.match(downloads.at(-2), new RegExp('Certificate-' + lang));
    assert.match(downloads.at(-1), new RegExp('Hash-Report-' + lang));
  }
  assert.equal(blobs.length, 4);
  mkdirSync(path.join(root, '.test-artifacts'), { recursive: true });
  for (let i = 0; i < blobs.length; i++) {
    const bytes = await new Promise((resolve, reject) => {
      const reader = new w.FileReader(); reader.onload = () => resolve(Buffer.from(reader.result)); reader.onerror = reject; reader.readAsArrayBuffer(blobs[i]);
    });
    assert.equal(bytes.readUInt32LE(0), 0x04034b50);
    const text = bytes.toString('utf8');
    assert.ok(text.includes(createHash('sha256').update('abc').digest('hex')));
    assert.ok(text.includes('Test &lt;Party&gt; &amp; Co'));
    if (i % 2 === 0) assert.ok(text.includes('Independent Expert'));
    if (i >= 2) assert.match(text, /[\u0900-\u097f]/);
    writeFileSync(path.join(root, '.test-artifacts', downloads[i]), bytes);
  }
});

test('Schedule exports use the official Hindi wording and checkbox placement', t => {
  const { w } = setup(t);
  const data = {
    lang: 'hi', algo: 'SHA256', files: [], sources: [], otherSource: '', make: '', colour: '', serial: '', devId: '', otherInfo: '', control: [],
    a: { name: '', rel: '', parent: '', res: '', address: '', date: '', time: '', place: '' },
    b: { name: '', rel: '', parent: '', res: '', address: '', desig: '', date: '', time: '', place: '' }
  };
  const body = w.certificateBody(data);
  assert.match(body, /धारा 63\(4\)\(ग\) देखिए/);
  assert.match(body, /इलेक्ट्रॉनिक अभिलेख\/आउटपुट प्रस्तुत किया है/);
  assert.match(body, /कथन करता\/करती हूँ/);
  assert.match(body, /प्रमाणपत्र के साथ हैश रिपोर्ट संलग्न करें/);
  const control = body.split('डिजिटल डिवाइस या डिजिटल अभिलेख का स्रोत मेरे द्वारा')[1].split('मैं, कथन करता/करती')[0];
  assert.equal((control.match(/☐/g) || []).length, 3, 'Hindi Schedule has no box after प्रचालित');
  assert.match(control, /प्रचालित/);
  changeDocumentLanguage(w, 'hi');
  assert.equal($controlOperated(w).hidden, true, 'Hindi editor hides the fourth control box');
  changeDocumentLanguage(w, 'en');
  assert.equal($controlOperated(w).hidden, false, 'English editor restores the fourth control box');
});

function changeDocumentLanguage(w, value) {
  const select = w.document.getElementById('docLang');
  select.value = value;
  select.dispatchEvent(new w.Event('change', { bubbles: true }));
}

function $controlOperated(w) {
  return w.document.querySelector('#control input[value="Operated"]').parentElement;
}
