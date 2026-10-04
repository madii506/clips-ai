// /api/clips          her clips (newest first), her life stage and the market cap it was read from
// /api/clips?img=ID   one clip's photo
// /api/clips?make=1   the clock (GitHub Actions) asks for her next clip; she posts at most every 8 hours, within the
//                     house's daily photo budget, always from her own portrait so it stays the same face.
const L = require('./_lib'), R = require('./_remi');
const GAP = 8 * 3600e3;
module.exports = async (req, res) => {
  L.setOidc(req);
  const qy = L.query(req);
  if (!L.dbReady()) return L.send(res, 200, { ok: false, error: 'Her records are offline.' });
  try {
    await L.ready();
    if (qy.img != null) {
      const r = (await L.q('SELECT img FROM p0_posts WHERE id=$1', [Number(qy.img) || 0]))[0];
      if (!r) return L.send(res, 404, { ok: false, error: 'No such clip.' });
      res.statusCode = 200; res.setHeader('Content-Type', 'image/jpeg'); res.setHeader('Cache-Control', 'public, max-age=86400, immutable'); return res.end(Buffer.from(r.img));
    }
    if (qy.like === '1' && req.method === 'POST') {
      if (L.limited('like:' + L.ip(req), 30, 600e3)) return L.send(res, 429, { ok: false, error: 'easy. she felt that.' });
      const r = (await L.q('UPDATE p0_state SET likes = likes + 1 WHERE id=1 RETURNING likes'))[0];
      return L.send(res, 200, { ok: true, likes: Number(r.likes) });
    }
    if (qy.make === '1') {
      if (L.limited('make', 6, 3600e3)) return L.send(res, 429, { ok: false, error: 'Slow down.' });
      const last = (await L.q('SELECT at FROM p0_posts ORDER BY id DESC LIMIT 1'))[0];
      if (last && Date.now() - new Date(last.at).getTime() < GAP) return L.send(res, 200, { ok: true, made: false, next: new Date(new Date(last.at).getTime() + GAP).toISOString() });
      const face = (await L.q('SELECT img FROM p0_brand WHERE n=0'))[0];
      if (!face) return L.send(res, 200, { ok: false, error: 'Her portrait isn’t made yet.' });
      if (!(await L.spendShot())) return L.send(res, 200, { ok: false, error: 'The daily photo budget is spent. Back at 00:00 UTC.' });
      const st = await R.stage(), recent = (await L.q('SELECT caption FROM p0_posts ORDER BY id DESC LIMIT 4')).map(r => r.caption);
      const p = await R.plan(st.i, recent); if (!p) return L.send(res, 200, { ok: false, error: 'She couldn’t decide. Next time.' });
      const shot = await L.photo(`A new photo of this exact same woman: ${p.scene} Keep her face, her jet-black bob with blunt bangs and her nose stud exactly the same. Photorealistic candid phone photo, natural skin texture, no text.`, Buffer.from(face.img).toString('base64'), 50000);
      if (!shot.ok) return L.send(res, 200, { ok: false, error: 'The shoot didn’t finish.' });
      const img = await require('sharp')(shot.buf).resize(900, 1125, { fit: 'cover', position: 'attention' }).jpeg({ quality: 88 }).toBuffer();
      const row = (await L.q('INSERT INTO p0_posts (mint, caption, scene, img) VALUES ($1,$2,$3,$4) RETURNING id, at', ['remi', p.caption, p.scene, img]))[0];
      return L.send(res, 200, { ok: true, made: true, id: row.id, caption: p.caption, stage: R.STAGES[st.i].key });
    }
    const [rows, st, lk] = await Promise.all([L.q('SELECT id, caption, at FROM p0_posts ORDER BY id DESC LIMIT 60'), R.stage(), L.q('SELECT likes FROM p0_state WHERE id=1')]);
    return L.send(res, 200, { ok: true, name: R.NAME, stage: st.i, mcap: st.mcap, likes: lk[0] ? Number(lk[0].likes) : 0, stages: R.STAGES.map(s => ({ at: s.at, key: s.key })), clips: rows.map(r => ({ id: Number(r.id), caption: r.caption, at: r.at })) });
  } catch (e) { return L.send(res, 200, { ok: false, error: 'Her records didn’t answer.' }); }
};
