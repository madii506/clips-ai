// CLIPS: her reel (a trailer of the life she can reach, then her real clips), her life strip read from the live market
// cap, her clips, talking to her (out loud if you like), and the camera's own clock. Nothing here is invented: an
// unknown number is a dash, and before the coin has a pool she is on day one.
(function () {
  'use strict';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CFG = window.CLIPS || {};
  const ago = t => { const s = Math.max(1, (Date.now() - new Date(t).getTime()) / 1000 | 0); return s < 60 ? s + 's ago' : s < 3600 ? (s / 60 | 0) + 'm ago' : s < 86400 ? (s / 3600 | 0) + 'h ago' : (s / 86400 | 0) + 'd ago'; };
  const usd = n => n == null ? '—' : n >= 1e6 ? '$' + (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? '$' + (n / 1e3).toFixed(1) + 'K' : '$' + Math.round(n);
  const toast = t => { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2200); };
  const LINES = [0, 25e3, 1e5, 5e5, 1e6];
  const TRAILER = [
    { src: '/api/ping?shot=1', cap: 'day one. me, a ring light and a dream.' },
    { src: '/api/ping?shot=2', cap: '$25K: the rooftop.' },
    { src: '/api/ping?shot=3', cap: '$100K: the penthouse.' },
    { src: '/api/ping?shot=4', cap: '$500K: the yacht.' },
    { src: '/api/ping?shot=5', cap: '$1M: the jet.' },
  ];
  // the hero phone: her day one, then what she's manifesting (the AI shot them from her portrait)
  const REEL = [
    { src: '/api/ping?shot=1', cap: 'day one. me, a ring light and a dream.' },
    { src: '/api/ping?shot=10', cap: 'manifesting: yacht week.' },
    { src: '/api/ping?shot=6', cap: 'manifesting: the red carpet.' },
    { src: '/api/ping?shot=11', cap: 'manifesting: bali.' },
    { src: '/api/ping?shot=3', cap: 'manifesting: the penthouse.' },
    { src: '/api/ping?shot=12', cap: 'manifesting: the maldives.' },
    { src: '/api/ping?shot=7', cap: 'manifesting: front row.' },
    { src: '/api/ping?shot=8', cap: 'manifesting: ibiza.' },
    { src: '/api/ping?shot=13', cap: 'manifesting: rooftop pools.' },
    { src: '/api/ping?shot=5', cap: 'manifesting: the jet.' },
    { src: '/api/ping?shot=9', cap: 'manifesting: my first cover.' },
  ];
  const STAGE = ['day one', 'rooftop', 'penthouse', 'yacht', 'jet'];
  let data = { stage: 0, mcap: null, clips: [] };

  // ---------- the camera's clock: real time since you opened the page ----------
  (function tc() { const el = $('#tc'), t0 = performance.now(); const p = n => String(n).padStart(2, '0');
    setInterval(() => { const ms = performance.now() - t0, f = Math.floor(ms / 1000 * 24) % 24, s = Math.floor(ms / 1000); el.textContent = `${p(s / 3600 | 0)}:${p((s / 60 | 0) % 60)}:${p(s % 60)}:${p(f)}`; }, 42); })();

  // ---------- the phones: the main one flips through her clips like a feed; the two behind it drift ----------
  const reel = (function () {
    const fr = $('#frames'), segs = $('#segs'), cap = $('#cap'), D = 2800;
    let list = REEL.slice(), i = -1, timer = 0, typer = 0, items = [];
    function build() {
      fr.innerHTML = ''; items = list.map((c, k) => { const d = document.createElement('div'); d.className = 'it'; d.innerHTML = `<img alt="" src="${esc(c.src)}" ${k > 2 ? 'loading="lazy"' : ''} decoding="async">`; fr.appendChild(d); return d; });
      segs.innerHTML = list.slice(0, 12).map(() => '<i><b></b></i>').join(''); segs.style.setProperty('--d', D / 1000 + 's');
    }
    function type(t) { clearInterval(typer); cap.textContent = ''; if (calm) { cap.textContent = t; return; } cap.classList.add('typing'); let k = 0; typer = setInterval(() => { k++; cap.textContent = t.slice(0, k); if (k >= t.length) { clearInterval(typer); cap.classList.remove('typing'); } }, 26); }
    function go(n, back) {
      if (!items.length) return; const prev = i; i = (n + list.length) % list.length;
      items.forEach((el, k) => { el.style.transition = (k === i || k === prev) && !calm ? '' : 'none'; el.classList.toggle('on', k === i); el.classList.toggle('out', k === prev && k !== i && !back); });
      if (back && prev >= 0) { const p = items[prev]; p.classList.remove('out'); }
      const nx = items[(i + 1) % items.length]; const im = nx && nx.querySelector('img'); if (im) im.loading = 'eager';
      [...segs.children].forEach((b, k) => { const j = i % segs.children.length; b.className = k < j ? 'done' : k === j ? 'now' : ''; });
      type(list[i].cap);
      clearTimeout(timer); if (!calm) timer = setTimeout(() => go(i + 1), D);
    }
    $('#reel').addEventListener('click', e => { if (e.target.closest('.rb')) return; const r = e.currentTarget.getBoundingClientRect(); go(e.clientX - r.left < r.width / 3 ? i - 1 : i + 1, e.clientX - r.left < r.width / 3); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); else if (!calm) timer = setTimeout(() => go(i + 1), D); });
    build(); go(0);
    // the two phones behind: slower, out of step
    [['#sideL', 4, 3400], ['#sideR', 7, 3900]].forEach(([sel, off, ms]) => {
      const el = $(sel); if (!el) return; let j = off % REEL.length;
      el.innerHTML = REEL.map((c, k) => `<div class="it${k === j ? ' on' : ''}"><img alt="" src="${esc(c.src)}" loading="${k === j || k === (j + 1) % REEL.length ? 'eager' : 'lazy'}" decoding="async"></div>`).join('');
      if (!calm) setInterval(() => { if (document.hidden) return; const its = el.children; its[j].classList.remove('on'); j = (j + 1) % its.length; its[j].classList.add('on'); const nx = its[(j + 1) % its.length].querySelector('img'); if (nx) nx.loading = 'eager'; }, ms);
    });
    return { add(clips) { const fresh = clips.slice(0, 6).map(c => ({ src: '/api/clips?img=' + c.id, cap: c.caption })); if (!fresh.length) return; list = fresh.concat(REEL); build(); go(0); } };
  })();

  // ---------- likes: real taps from real visitors, counted by the server ----------
  (function likes() {
    const btn = $('#likeBtn'), out = $('#likes');
    function burst(x, y) { if (calm) return; for (let k = 0; k < 8; k++) { const h = document.createElement('i'); h.className = 'burst'; h.style.left = x - 9 + 'px'; h.style.top = y - 9 + 'px'; h.style.setProperty('--bx', (Math.random() * 120 - 60).toFixed(0) + 'px'); h.style.setProperty('--by', (-60 - Math.random() * 110).toFixed(0) + 'px'); h.style.setProperty('--br', (Math.random() * 80 - 40).toFixed(0) + 'deg'); document.body.appendChild(h); setTimeout(() => h.remove(), 1100); } }
    btn.addEventListener('click', async e => {
      const r = btn.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + 14);
      btn.classList.remove('liked'); void btn.offsetWidth; btn.classList.add('liked');
      try { const j = await fetch('/api/clips?like=1', { method: 'POST' }).then(r => r.json()); if (j && j.ok) out.textContent = j.likes.toLocaleString(); else if (j && j.error) toast(j.error); } catch {}
    });
    const sh = $('#shareX'); sh.href = 'https://x.com/intent/post?text=' + encodeURIComponent('an AI is raising one influencer. make her famous. ' + location.origin);
  })();

  // ---------- her life strip ----------
  let stripKey = '', feedKey = '';
  function strip() {
    const el = $('#strip'), si = data.stage || 0, key = si + '|' + data.mcap; if (key === stripKey) return; stripKey = key;
    el.innerHTML = TRAILER.map((t, k) => `<figure class="st rv ${k <= si ? '' : 'locked'} ${k === si ? 'here' : ''}" style="--d:${k * .08}s"><div class="ph"><img src="${t.src}" alt="" loading="lazy"></div><figcaption><b>${STAGE[k]}</b><span>${k ? usd(LINES[k]) : 'start'}</span></figcaption></figure>`).join('');
    $('#mcap').textContent = usd(data.mcap);
    const nx = LINES[si + 1], cur = LINES[si], pct = data.mcap == null ? 0 : nx ? Math.max(0, Math.min(1, (data.mcap - cur) / (nx - cur))) : 1;
    setTimeout(() => { $('#meter').style.width = (pct * 100).toFixed(1) + '%'; }, 300);
    reveal(el.querySelectorAll('.st'));
  }

  // ---------- her clips ----------
  const seen = new Set();
  function feed() {
    const el = $('#feed'), cs = data.clips || [], key = cs.map(c => c.id).join(','); if (key === feedKey && el.children.length) return; feedKey = key;
    if (!cs.length) { el.innerHTML = `<figure class="clip rv"><div class="in2"><img src="/api/ping?shot=1" alt="" loading="lazy"><span class="play">▶</span></div><figcaption>day one. me, a ring light and a dream.<time>her first clip</time></figcaption></figure>`; reveal(el.children); return; }
    let k = 0;
    el.innerHTML = cs.map(c => { const nw = !seen.has(c.id); seen.add(c.id); return `<figure class="clip${nw ? ' new' : ''}" style="--i:${nw ? k++ : 0}"><div class="in2"><img src="/api/clips?img=${c.id}" alt="" loading="lazy"><span class="play">▶</span></div><figcaption>${esc(c.caption)}<time>${ago(c.at)}</time></figcaption></figure>`; }).join('');
    tilt(el.querySelectorAll('.clip .in2'));
  }
  function tilt(els) { if (calm || matchMedia('(hover: none)').matches) return; els.forEach(c => { c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(0)`; }); c.addEventListener('pointerleave', () => { c.style.transform = ''; }); }); }

  // ---------- the tape: her own captions ----------
  function tape() { const caps = (data.clips || []).map(c => c.caption).concat(TRAILER.map(t => t.cap)).slice(0, 10); const h = caps.map(c => `<span>${esc(c)}</span>`).join(''); $('#tape').innerHTML = h + h; }

  async function load() {
    try { const r = await fetch('/api/clips', { cache: 'no-store' }); const j = await r.json(); if (j && j.ok) { const had = (data.clips || []).length; data = j; if (j.likes != null) $('#likes').textContent = Number(j.likes).toLocaleString(); if (j.clips.length && j.clips.length !== had) reel.add(j.clips); } } catch {}
    strip(); feed(); tape();
  }

  // ---------- talking to her ----------
  (function talk() {
    const said = $('#said'), inp = $('#askIn'), btn = $('#askBtn'), mute = $('#mute'); let hist = [], voiceOn = true;
    try { voiceOn = localStorage.getItem('clips-voice') !== 'off'; } catch {}
    const showMute = () => { mute.textContent = voiceOn ? 'voice on' : 'voice off'; }; showMute();
    mute.onclick = () => { voiceOn = !voiceOn; try { localStorage.setItem('clips-voice', voiceOn ? 'on' : 'off'); } catch {} if (!voiceOn && 'speechSynthesis' in window) speechSynthesis.cancel(); showMute(); };
    function speak(t) {
      if (!voiceOn || !('speechSynthesis' in window)) return;
      try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t), vs = speechSynthesis.getVoices(); const v = vs.find(v => /female|samantha|zira|jenny|aria|victoria|karen|moira|tessa/i.test(v.name) && /^en/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)); if (v) u.voice = v; u.pitch = 1.12; u.rate = 1.03; speechSynthesis.speak(u); } catch {}
    }
    if ('speechSynthesis' in window) setInterval(() => document.body.classList.toggle('speaking', !!speechSynthesis.speaking), 150);
    function bubble(cls, text) { const p = document.createElement('p'); p.className = cls; said.appendChild(p); if (cls === 'her' && !calm) { p.classList.add('typing'); let k = 0; const st = Math.max(1, Math.ceil(text.length / 60)); const iv = setInterval(() => { k += st; p.textContent = text.slice(0, k); said.scrollTop = said.scrollHeight; if (k >= text.length) { clearInterval(iv); p.classList.remove('typing'); } }, 24); } else p.textContent = text; said.scrollTop = said.scrollHeight; }
    $('#ask').addEventListener('submit', async e => {
      e.preventDefault(); const q = inp.value.trim(); if (!q) return;
      inp.value = ''; bubble('you', q); btn.disabled = true; said.classList.add('wait');
      try { const r = await fetch('/api/think', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ q, history: hist }) }).then(r => r.json()); if (r.ok) { bubble('her', r.text); speak(r.text); hist.push({ q, a: r.text }); hist = hist.slice(-4); } else bubble('sys', r.error || 'She didn’t answer. Try again.'); }
      catch { bubble('sys', 'She didn’t answer. Try again.'); }
      finally { btn.disabled = false; said.classList.remove('wait'); inp.focus(); }
    });
  })();

  // ---------- the address, once it's real ----------
  if (CFG.ca) {
    $('#ca').hidden = false; $('#caTxt').textContent = CFG.ca.slice(0, 4) + '…' + CFG.ca.slice(-4);
    $('#caBtn').onclick = () => { navigator.clipboard && navigator.clipboard.writeText(CFG.ca).then(() => toast('copied')); };
    $('#buy').href = 'https://pump.fun/coin/' + CFG.ca; $('#chart').href = 'https://dexscreener.com/solana/' + CFG.ca;
    if (CFG.x) $('#xl').href = CFG.x; else $('#xl').remove();
  }

  // ---------- reveals, nav, the wordmark drifting as you scroll ----------
  const io = !calm && 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('seen'); if (en.target.matches('.st')) en.target.classList.add('develop'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;
  function reveal(els) { [...els].forEach(el => { if (!io) { el.classList.add('seen'); return; } el.classList.add('rv'); io.observe(el); }); }
  reveal($$('.sh, .chat, .faq details'));
  if ('IntersectionObserver' in window) { const links = $$('.nav a'); const nio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(a => a.classList.toggle('on', a.hash === '#' + en.target.id)); }), { rootMargin: '-45% 0px -50% 0px' }); ['life', 'clips', 'talk', 'faq'].forEach(id => nio.observe(document.getElementById(id))); }
  if (!calm) { const wm = $('.wm'); let tk = false; addEventListener('scroll', () => { if (tk) return; tk = true; requestAnimationFrame(() => { tk = false; const y = Math.min(scrollY, innerHeight); wm.style.transform = `translateX(-50%) translateY(${(y * .35).toFixed(1)}px) scale(${(1 - y / innerHeight * .12).toFixed(3)})`; }); }, { passive: true }); }

  load(); setInterval(() => { if (!document.hidden) load(); }, 60000);
})();
