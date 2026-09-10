/* Page controls restored from d521172; certificate core and layout stay in index.html. */

(function () {
  var files = [];   // {name, size, bytes, hash, date, time}
  var uiLang = 'en', computeVersion = 0, readVersion = 0, verifyVersion = 0, verifyReadVersion = 0;
  var pendingReads = 0, warningsShown = false, vFile = null, verifyLoading = false;
  var english = {};
  var hindi = {
    act: 'भारतीय साक्ष्य अधिनियम, 2023 — अनुसूची, धारा 63(4)(ग) देखें',
    h1: 'इलेक्ट्रॉनिक अभिलेख के लिए प्रमाणपत्र',
    sub: 'अनुसूची का प्रपत्र (भाग क और भाग ख) भरें, इसी कंप्यूटर पर इलेक्ट्रॉनिक अभिलेख का हैश निकालें और प्रमाणपत्र तथा हैश रिपोर्ट Word दस्तावेज़ के रूप में डाउनलोड करें। किसी अन्य व्यक्ति के बताए हैश को फ़ाइल से जाँच भी सकते हैं। आपका विवरण और फ़ाइलें इस पृष्ठ से बाहर नहीं भेजे जाते।',
    explainerLink: 'पहली बार उपयोग कर रहे हैं? <a href="explainer.html#hi">एक पृष्ठ का परिचय पढ़ें</a> — प्रमाणपत्र क्या है, कब चाहिए, कौन हस्ताक्षर करता है और क्या साथ लाना है।',
    notice: '<strong>आपकी कार्यवाही पर कौन-सा कानून लागू है?</strong> यह 1 जुलाई 2024 से लागू भारतीय साक्ष्य अधिनियम, 2023 की अनुसूची का प्रपत्र है। धारा 170 के अनुसार उस तारीख से पहले लंबित मामलों पर भारतीय साक्ष्य अधिनियम, 1872 लागू रह सकता है, जिसकी धारा 65बी में कोई निर्धारित प्रपत्र नहीं है। उपयोग से पहले लागू कानून की पुष्टि करें।',
    docLangLabel: 'प्रमाणपत्र और हैश रिपोर्ट की भाषा', docLangNote: 'दस्तावेज़ और अनुसूची की उद्धृत पंक्तियाँ इस चयन के अनुसार होंगी।',
    h2_1: '1. इलेक्ट्रॉनिक अभिलेख और हैश मान', algoLabel: 'एल्गोरिथ्म (एक प्रमाणपत्र में एक एल्गोरिथ्म)',
    optSha1: 'SHA1 — कमजोर; ज्ञात कोलिज़न हमले', optMd5: 'MD5 — कमजोर; ज्ञात कोलिज़न हमले',
    dropMain: 'इलेक्ट्रॉनिक अभिलेख की फ़ाइलें यहाँ छोड़ें या चुनने के लिए क्लिक करें। वही फ़ाइल चुनें जो न्यायालय में प्रस्तुत करेंगे; उसका हैश उसकी वर्तमान स्थिति में निकाला जाएगा।',
    resaveNote: 'हैश निकालने के बाद फ़ाइल खोलकर दोबारा सेव न करें; हैश बदल सकता है। बहुत बड़ी फ़ाइलों में समय लग सकता है।',
    h2_2: '2. भाग क — पक्षकार द्वारा भरा जाए', name: 'नाम', relLabel: 'पुत्र / पुत्री / पति या पत्नी',
    asPrinted: '— जैसा छपा है वैसा छोड़ें —', son: 'पुत्र', daughter: 'पुत्री', spouse: 'पति/पत्नी',
    parentLabel: 'पिता / माता / पति या पत्नी का नाम', resLabel: 'निवास / नियोजन', residing: 'निवासी', employed: 'नियोजित', address: 'पता',
    h3_source: 'डिवाइस / डिजिटल अभिलेख का स्रोत', src0: 'कंप्यूटर / स्टोरेज मीडिया', src1: 'डीवीआर', src2: 'मोबाइल', src3: 'फ़्लैश ड्राइव',
    src4: 'सीडी/डीवीडी', src5: 'सर्वर', src6: 'क्लाउड', src7: 'अन्य', otherSpecify: 'अन्य (विनिर्दिष्ट करें)',
    h3_particulars: 'डिवाइस / डिजिटल अभिलेख का विवरण', make: 'बनावट और मॉडल', colour: 'रंग', serial: 'क्रम संख्या',
    devId: 'IMEI / UIN / UID / MAC / क्लाउड आईडी (जैसा लागू हो)', otherInfo: 'डिवाइस / डिजिटल अभिलेख के बारे में अन्य सुसंगत जानकारी',
    h3_control: 'डिवाइस का नियंत्रण', ctl0: 'स्वामित्वाधीन', ctl1: 'अनुरक्षित', ctl2: 'प्रबंधित', ctl3: 'प्रचालित',
    declNote: 'विधिपूर्ण नियंत्रण, नियमित उपयोग और समुचित कार्यप्रणाली की अनुसूची वाली घोषणा प्रमाणपत्र में पूरी छपेगी; उसे यहाँ बदला नहीं जा सकता।',
    h3_date: 'हस्ताक्षर की तारीख, समय और स्थान', date: 'तारीख (DD/MM/YYYY)', time: 'समय (IST, 24 घंटे, HH:MM)', place: 'स्थान',
    h2_3: '3. भाग ख — विशेषज्ञ द्वारा भरा जाए',
    partBNote: 'भाग ख में डिवाइस का विवरण, स्रोत, हैश और एल्गोरिथ्म ऊपर भरे भाग क से लिए जाते हैं। हस्ताक्षर करने से पहले विशेषज्ञ उनकी जाँच करें। भाग ख पर कौन हस्ताक्षर कर सकता है, यह विधि का खुला प्रश्न है — खंड 6 का निर्णय 4 देखें। भाग क के हस्ताक्षरकर्ता का विवरण यहाँ नहीं भरा जाता।',
    expertName: 'विशेषज्ञ का नाम (विशेषज्ञ द्वारा बाद में भरने के लिए खाली छोड़ सकते हैं)', designation: 'पदनाम',
    h2_4: '4. दस्तावेज़ तैयार करें', btnCert: 'प्रमाणपत्र डाउनलोड करें (.docx)', btnReport: 'हैश रिपोर्ट डाउनलोड करें (.docx)', btnClear: 'सब कुछ साफ़ करें',
    produceNote: 'खाली खानों की जगह हाथ से भरने के लिए खाली पंक्तियाँ छपेंगी। प्रमाणपत्र अनुसूची के शब्दों में Word फ़ाइल है; दाखिल करने से पहले राजपत्र से जाँचें। हैश की स्वतंत्र जाँच: <code>certutil -hashfile &lt;file&gt; SHA256</code> (Windows) या <code>shasum -a 256 &lt;file&gt;</code> (macOS/Linux)।',
    h2_5: '5. किसी अन्य व्यक्ति द्वारा बताए हैश की जाँच करें',
    verifyIntro: 'दूसरे पक्ष या पुलिस के प्रमाणपत्र में दिया हैश यहाँ पेस्ट करें और उसके साथ प्रस्तुत फ़ाइल चुनें। पृष्ठ दोबारा हैश निकालकर मिलान बताएगा। मान की लंबाई से एल्गोरिथ्म पहचाना जाता है: 64 अक्षर SHA256, 40 SHA1, 32 MD5।',
    statedLabel: 'प्रमाणपत्र में बताया गया हैश मान', vDrop: 'उस प्रमाणपत्र के साथ प्रस्तुत फ़ाइल यहाँ छोड़ें या चुनने के लिए क्लिक करें।',
    h2_6: '6. वे निर्णय जो यह पृष्ठ नहीं करता', decisionsNote: 'नीचे दिए स्रोतों के आधार पर तैयार नोट्स अभी अंग्रेज़ी में हैं। ये कानूनी सलाह नहीं हैं; भरोसा करने से पहले अधिवक्ता समीक्षा करें।'
  };
  var messages = {
    en: { computing: 'Computing', copy: 'Copy hash', copied: 'Copied', copyFailed: 'Copy failed; select and copy the hash manually.', remove: 'Remove', bytes: 'bytes', computed: 'computed', at: 'at',
      failed: 'Could not read or hash this file. Remove it and choose it again.', blanks: 'Printed with blanks for:',
      partB: 'The Part B signatory is the same person as Part A. Whether the party may sign Part B as the expert is an open question of law (decision 4).',
      invalid: 'The stated value is not a recognisable SHA256, SHA1 or MD5 hash (64, 40 or 32 hexadecimal characters; spaces are allowed).',
      choose: 'Drop or choose one file to compare.', match: 'Match.', mismatch: 'No match.', same: 'The computed hash is identical to the stated value.',
      different: 'The computed hash differs from the stated value. Either this is not the file the certificate refers to, or it has been altered since the hash was taken, or the certificate is wrong.',
      now: 'Computed now', stated: 'As stated in the certificate:', confirm: 'Clear all fields and remove all files?',
      unavailable: 'SHA hashing is unavailable here. Open the page over HTTPS or on localhost in a current browser.',
      multiple: 'Choose one file at a time for verification.', pending: 'Wait for all files to finish hashing; remove any failed file before downloading.', readFailed: 'Could not read the selected file. Please choose it again.' },
    hi: { computing: 'हैश निकाला जा रहा है', copy: 'हैश कॉपी करें', copied: 'कॉपी हो गया', copyFailed: 'कॉपी नहीं हो सका; हैश चुनकर स्वयं कॉपी करें।', remove: 'हटाएँ', bytes: 'बाइट', computed: 'हैश निकाला गया', at: 'समय',
      failed: 'इस फ़ाइल को पढ़ा नहीं जा सका या हैश नहीं निकला। हटाकर दोबारा चुनें।', blanks: 'इन विवरणों के लिए खाली स्थान छपे हैं:',
      partB: 'भाग ख और भाग क के हस्ताक्षरकर्ता एक ही व्यक्ति हैं। पक्षकार विशेषज्ञ के रूप में भाग ख पर हस्ताक्षर कर सकता है या नहीं, यह विधि का खुला प्रश्न है (निर्णय 4)।',
      invalid: 'मान पहचान योग्य SHA256, SHA1 या MD5 हैश नहीं है (64, 40 या 32 हेक्साडेसिमल अक्षर; बीच में रिक्त स्थान स्वीकार हैं)।',
      choose: 'मिलान के लिए एक फ़ाइल छोड़ें या चुनें।', match: 'मिलान हुआ।', mismatch: 'मिलान नहीं हुआ।', same: 'निकाला गया हैश बताए गए मान के समान है।',
      different: 'निकाला गया हैश बताए गए मान से अलग है। फ़ाइल अलग हो सकती है, हैश निकालने के बाद बदली हो सकती है या प्रमाणपत्र में त्रुटि हो सकती है।',
      now: 'अभी निकाला गया', stated: 'प्रमाणपत्र में बताया गया मान:', confirm: 'सभी विवरण और फ़ाइलें हटाएँ?',
      unavailable: 'यहाँ SHA हैश उपलब्ध नहीं है। वर्तमान ब्राउज़र में पृष्ठ HTTPS या localhost पर खोलें।',
      multiple: 'जाँच के लिए एक बार में एक फ़ाइल चुनें।', pending: 'सभी फ़ाइलों का हैश निकलने तक प्रतीक्षा करें; डाउनलोड से पहले असफल फ़ाइल हटाएँ।', readFailed: 'चुनी गई फ़ाइल पढ़ी नहीं जा सकी। दोबारा चुनें।' }
  };
  var missingLabels = {
    en: { aName: 'Part A: name', aParent: 'Part A: name of father / mother / spouse', aAddress: 'Part A: address', sources: 'Device / digital record source', otherSource: 'Other source details', make: 'Make & Model', control: 'Control of device', files: 'No electronic record hashed', aDate: 'Part A: date', aTime: 'Part A: time', aPlace: 'Part A: place', bName: 'Part B: expert name (printed blank for completion)' },
    hi: { aName: 'भाग क: नाम', aParent: 'भाग क: पिता / माता / पति या पत्नी का नाम', aAddress: 'भाग क: पता', sources: 'डिवाइस / डिजिटल अभिलेख का स्रोत', otherSource: 'अन्य स्रोत का विवरण', make: 'बनावट और मॉडल', control: 'डिवाइस का नियंत्रण', files: 'किसी इलेक्ट्रॉनिक अभिलेख का हैश नहीं निकाला गया', aDate: 'भाग क: तारीख', aTime: 'भाग क: समय', aPlace: 'भाग क: स्थान', bName: 'भाग ख: विशेषज्ञ का नाम (बाद में भरने के लिए खाली)' }
  };
  function msg(key) { return messages[uiLang][key]; }
  document.querySelectorAll('[data-i18n]').forEach(function (el) { english[el.dataset.i18n] = el.innerHTML; });
  function applyUI(lang) {
    uiLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.classList.toggle('ui-hi', lang === 'hi');
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.innerHTML = lang === 'hi' ? hindi[el.dataset.i18n] : english[el.dataset.i18n];
    });
    $('uiEn').setAttribute('aria-pressed', String(lang === 'en'));
    $('uiHi').setAttribute('aria-pressed', String(lang === 'hi'));
    renderFiles(); checkPartB(); runVerify();
    if (warningsShown) showWarnings(readForm());
  }

  function $(id) { return document.getElementById(id); }
  function ticked(containerId) {
    return Array.prototype.map.call(document.querySelectorAll('#' + containerId + ' input:checked'), function (c) { return c.value; });
  }

  /** Read every form field into the data object used by the core builders. */
  function readForm() {
    return {
      lang: $('docLang').value,
      algo: $('algo').value,
      files: files.filter(function (f) { return f.hash; }),
      sources: ticked('sources'),
      otherSource: $('otherSource').value,
      make: $('make').value, colour: $('colour').value, serial: $('serial').value,
      devId: $('devId').value, otherInfo: $('otherInfo').value,
      control: ticked('control'),
      a: { name: $('aName').value, rel: $('aRel').value, parent: $('aParent').value, res: $('aRes').value,
           address: $('aAddress').value, date: $('aDate').value, time: $('aTime').value, place: $('aPlace').value },
      b: { name: $('bName').value, rel: $('bRel').value, parent: $('bParent').value, res: $('bRes').value,
           address: $('bAddress').value, desig: $('bDesig').value, date: $('bDate').value, time: $('bTime').value, place: $('bPlace').value }
    };
  }

  /** Hex string as eight-character groups in spans; spacing is visual only, so copying yields the continuous value. */
  function groups(hex) {
    return hex.match(/.{1,8}/g).map(function (g) { return '<span>' + g + '</span>'; }).join('');
  }

  /** Render one block per file: name, the hash large, then algorithm, size and time. */
  function renderFiles() {
    var busy = pendingReads > 0 || files.some(function (f) { return !f.hash; });
    $('genCert').disabled = busy;
    $('genReport').disabled = busy;
    var el = $('fileList');
    if (files.length === 0) { el.innerHTML = ''; return; }
    var algo = $('algo').value;
    el.innerHTML = files.map(function (f, i) {
      var hash = f.hash
        ? '<div class="hashval">' + groups(f.hash) + '</div>'
        : '<div class="hashval pending">' + (f.error ? esc(msg('failed')) : esc(msg('computing')) + ' ' + esc(algo) + '…') + '</div>';
      var meta = f.hash
        ? '<div class="meta">' + esc(algo) + ', ' + f.size.toLocaleString('en-IN') + ' ' + msg('bytes') + ', ' + msg('computed') + ' ' + esc(f.date) + ' ' + msg('at') + ' ' + esc(f.time) + ' IST</div>'
        : '';
      return '<div class="record"><div class="name"><span>' + (i + 1) + '. ' + esc(f.name) + '</span>' +
        '<span class="tools">' + (f.hash ? '<button class="small quiet" data-copy="' + i + '">' + msg('copy') + '</button>' : '') +
        '<button class="small quiet" data-remove="' + i + '">' + msg('remove') + '</button></span></div>' + hash + meta + '</div>';
    }).join('');
    Array.prototype.forEach.call(el.querySelectorAll('button[data-remove]'), function (b) {
      b.addEventListener('click', function () { files.splice(Number(b.getAttribute('data-remove')), 1); renderFiles(); });
    });
    Array.prototype.forEach.call(el.querySelectorAll('button[data-copy]'), function (b) {
      b.addEventListener('click', function () {
        var h = files[Number(b.getAttribute('data-copy'))].hash;
        copyHash(h).then(function () { b.textContent = msg('copied'); setTimeout(function () { b.textContent = msg('copy'); }, 1500); })
          .catch(function () { alert(msg('copyFailed')); });
      });
    });
  }

  function esc(s) { return xmlEscape(s); }

  async function copyHash(hash) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try { await navigator.clipboard.writeText(hash); return; } catch (_) { /* Try the local selection fallback. */ }
    }
    var active = document.activeElement, field = document.createElement('textarea');
    field.value = hash; field.style.position = 'fixed'; field.style.opacity = '0';
    document.body.appendChild(field); field.select();
    try { if (!document.execCommand('copy')) throw new Error('Clipboard unavailable'); }
    finally { field.remove(); if (active) active.focus(); }
  }

  /** Compute (or recompute) hashes for every file with the selected algorithm. */
  async function computeAll() {
    var algo = $('algo').value, version = ++computeVersion;
    files.forEach(function (f) { f.hash = ''; f.error = false; });
    renderFiles();
    for (var f of files.slice()) {
      if (version !== computeVersion) return;
      if (files.indexOf(f) < 0) continue;
      try {
        var h = await hashBytes(f.bytes, algo);
        if (version !== computeVersion) return;
        if (files.indexOf(f) < 0) continue;
        var t = istNow(); f.hash = h; f.date = t.date; f.time = t.time;
      } catch (_) { if (version !== computeVersion) return; f.error = true; }
      renderFiles();
    }
  }

  /** Add dropped or chosen files, reading each fully into memory. */
  async function addFiles(list) {
    var selected = Array.from(list || []), version = readVersion;
    if (!selected.length) return;
    pendingReads++; renderFiles();
    var results = await Promise.allSettled(selected.map(async function (file) {
      var buf = await file.arrayBuffer();
      return { name: file.name, size: file.size, bytes: new Uint8Array(buf), hash: '' };
    }));
    if (version !== readVersion) return;
    pendingReads--;
    results.forEach(function (result) { if (result.status === 'fulfilled') files.push(result.value); });
    if (results.some(function (result) { return result.status === 'rejected'; })) alert(msg('readFailed'));
    await computeAll();
  }

  /** Trigger a download of bytes under the given filename. */
  function download(bytes, filename) {
    var blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  /** Show the list of blank items above the buttons. */
  function showWarnings(d) {
    warningsShown = true;
    var m = missingItems(d);
    $('warnings').innerHTML = m.length
      ? '<div class="warn">' + msg('blanks') + '<ul><li>' + m.map(function (key) { return esc(missingLabels[uiLang][key]); }).join('</li><li>') + '</li></ul></div>'
      : '';
  }

  /** Warn when the Part B name matches the Part A name. */
  function checkPartB() {
    var a = $('aName').value.trim(), b = $('bName').value.trim();
    $('bWarn').innerHTML = (a && b && a.toLowerCase() === b.toLowerCase())
      ? '<div class="warn">' + msg('partB') + '</div>'
      : '';
  }

  function stamp() {
    var t = istNow();
    ['aDate', 'bDate'].forEach(function (id) { if (!$(id).value) $(id).value = t.date; });
    ['aTime', 'bTime'].forEach(function (id) { if (!$(id).value) $(id).value = t.time; });
  }

  // Language of documents and quoted Schedule lines
  Array.prototype.forEach.call(document.querySelectorAll('.statute[data-hi]'), function (p) { p.setAttribute('data-en', p.innerHTML); });
  function applyLang() {
    var hi = $('docLang').value === 'hi';
    Array.prototype.forEach.call(document.querySelectorAll('.statute[data-hi]'), function (p) {
      p.innerHTML = hi ? p.getAttribute('data-hi') : p.getAttribute('data-en');
      if (hi) p.setAttribute('lang', 'hi'); else p.removeAttribute('lang');
    });
    // The Hindi Gazette has no checkbox after प्रचालित; keep the editor's
    // control row visually identical to that source while Hindi is selected.
    var operated = document.querySelector('#control input[value="Operated"]');
    if (operated && operated.parentElement) {
      operated.parentElement.hidden = hi;
      if (hi) operated.checked = false;
    }
  }
  $('docLang').addEventListener('change', applyLang);

  // Verify: recompute a stated hash against a dropped file
  function statedAlgo(text) {
    var h = String(text || '').toLowerCase().replace(/\s/g, '');
    if (!/^[0-9a-f]+$/.test(h)) return null;
    if (h.length === 64) return { algo: 'SHA256', hex: h };
    if (h.length === 40) return { algo: 'SHA1', hex: h };
    if (h.length === 32) return { algo: 'MD5', hex: h };
    return null;
  }
  async function runVerify() {
    var out = $('vResult'), version = ++verifyVersion;
    var stated = statedAlgo($('statedHash').value);
    if (verifyLoading) { out.textContent = msg('computing') + '…'; return; }
    if (!vFile && !$('statedHash').value.trim()) { out.innerHTML = ''; return; }
    if (!stated) { out.textContent = msg('invalid'); return; }
    if (!vFile) { out.textContent = stated.algo + '. ' + msg('choose'); return; }
    var selected = vFile;
    out.textContent = msg('computing') + ' ' + stated.algo + ': ' + selected.name + '…';
    try {
      var h = await hashBytes(selected.bytes, stated.algo);
      if (version !== verifyVersion) return;
      var same = h === stated.hex;
      var t = istNow();
      out.innerHTML =
        '<div class="verdict' + (same ? '' : ' bad') + '">' + msg(same ? 'match' : 'mismatch') + '</div>' +
        '<p><strong>' + esc(selected.name) + '</strong> (' + selected.size.toLocaleString('en-IN') + ' ' + msg('bytes') + ', ' + stated.algo + '). ' + msg(same ? 'same' : 'different') + '</p>' +
        '<div class="meta">' + msg('now') + ', ' + esc(t.date) + ' ' + msg('at') + ' ' + esc(t.time) + ' IST:</div><div class="hashval">' + groups(h) + '</div>' +
        '<div class="meta">' + msg('stated') + '</div><div class="hashval">' + groups(stated.hex) + '</div>';
    } catch (_) { if (version === verifyVersion) out.textContent = msg('failed'); }
  }
  var vDrop = $('vDrop'), vInput = $('vFileInput');
  async function takeVerifyFile(list) {
    if (!list || !list.length) return;
    var version = ++verifyReadVersion;
    ++verifyVersion; vFile = null; verifyLoading = false;
    if (list.length !== 1) { $('vResult').textContent = msg('multiple'); return; }
    var f = list[0]; verifyLoading = true; runVerify();
    try {
      var buf = await f.arrayBuffer();
      if (version !== verifyReadVersion) return;
      vFile = { name: f.name, size: f.size, bytes: new Uint8Array(buf) }; verifyLoading = false; runVerify();
    } catch (_) { if (version === verifyReadVersion) { verifyLoading = false; $('vResult').textContent = msg('readFailed'); } }
  }
  vDrop.addEventListener('click', function (e) { if (e.target !== vInput) vInput.click(); });
  vInput.addEventListener('change', function () { takeVerifyFile(vInput.files); vInput.value = ''; });
  vDrop.addEventListener('dragover', function (e) { e.preventDefault(); vDrop.classList.add('over'); });
  vDrop.addEventListener('dragleave', function () { vDrop.classList.remove('over'); });
  vDrop.addEventListener('drop', function (e) { e.preventDefault(); vDrop.classList.remove('over'); takeVerifyFile(e.dataTransfer.files); });
  $('statedHash').addEventListener('input', runVerify);

  // Drop zone
  var drop = $('drop'), input = $('fileInput');
  drop.addEventListener('click', function (e) { if (e.target !== input) input.click(); });
  input.addEventListener('change', function () { addFiles(input.files); input.value = ''; });
  drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', function () { drop.classList.remove('over'); });
  drop.addEventListener('drop', function (e) { e.preventDefault(); drop.classList.remove('over'); addFiles(e.dataTransfer.files); });

  $('algo').addEventListener('change', computeAll);
  $('aName').addEventListener('input', checkPartB);
  $('bName').addEventListener('input', checkPartB);

  $('genCert').addEventListener('click', function () {
    if (pendingReads || files.some(function (f) { return !f.hash; })) { alert(msg('pending')); return; }
    var d = readForm();
    showWarnings(d);
    download(buildDocx(certificateBody(d)), 'Section-63-Certificate-' + d.lang + '-' + istNow().date.replace(/\//g, '-') + '.docx');
  });
  $('genReport').addEventListener('click', function () {
    if (pendingReads || files.some(function (f) { return !f.hash; })) { alert(msg('pending')); return; }
    var d = readForm();
    showWarnings(d);
    download(buildDocx(hashReportBody(d)), 'Section-63-Hash-Report-' + d.lang + '-' + istNow().date.replace(/\//g, '-') + '.docx');
  });
  $('clearAll').addEventListener('click', function () {
    if (!confirm(msg('confirm'))) return;
    ++readVersion; ++computeVersion; ++verifyVersion; ++verifyReadVersion;
    pendingReads = 0; verifyLoading = false; warningsShown = false;
    files = []; vFile = null; $('vResult').innerHTML = '';
    Array.prototype.forEach.call(document.querySelectorAll('input[type=text], textarea'), function (i) { i.value = ''; });
    Array.prototype.forEach.call(document.querySelectorAll('input[type=checkbox]'), function (c) { c.checked = false; });
    Array.prototype.forEach.call(document.querySelectorAll('select'), function (s) { s.selectedIndex = 0; });
    $('warnings').innerHTML = ''; $('bWarn').innerHTML = '';
    renderFiles(); stamp(); applyLang();
  });

  if (!(window.crypto && crypto.subtle)) {
    $('warnings').innerHTML = '<div class="warn">' + msg('unavailable') + '</div>';
  }
  // Both zones work with keyboard activation as well as pointer and file drop.
  [drop, vDrop].forEach(function (zone) {
    zone.setAttribute('role', 'button'); zone.tabIndex = 0;
    zone.addEventListener('keydown', function (e) {
      if (e.target === zone && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); zone.click(); }
    });
  });
  // Prevent a misplaced file drop from navigating away and losing the form.
  ['dragover', 'drop'].forEach(function (name) {
    window.addEventListener(name, function (e) {
      if (e.dataTransfer && Array.from(e.dataTransfer.types).indexOf('Files') >= 0) e.preventDefault();
    });
  });
  $('uiEn').addEventListener('click', function () { applyUI('en'); });
  $('uiHi').addEventListener('click', function () { applyUI('hi'); });
  stamp();
})();
