// POST /api/think {q, history}  talk to Remi. Rate-limited per address; she never gives financial advice.
const L = require('./_lib'), R = require('./_remi');
module.exports = async (req, res) => {
  L.setOidc(req);
  if (req.method !== 'POST') return L.send(res, 405, { ok: false, error: 'POST only.' });
  const b = await L.body(req, 16 * 1024); if (b.tooBig) return L.send(res, 413, { ok: false, error: 'Too long.' });
  const q = L.clean(b.q, 300); if (!q) return L.send(res, 400, { ok: false, error: 'Say something.' });
  if (L.limited('think:' + L.ip(req), 20, 3600e3) || L.limited('think', 600, 3600e3)) return L.send(res, 429, { ok: false, error: 'She needs a minute. Try again soon.' });
  const r = await R.answer(q, Array.isArray(b.history) ? b.history : []);
  L.send(res, 200, r);
};
