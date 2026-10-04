// GET /api/ping  is everything clips needs answering? (the records, the studio)
// ?shot=0..5  her brand photos (a fictional adult, made with FLUX once and kept): 0 is her portrait, 1..5 her life as it
// grows, each made from the portrait so it stays the same face. Fixed prompts only, so nothing arbitrary is generated here.
const L = require('./_lib');
const FACE = 'Close-up portrait photo of a fictional 23-year-old woman with a glossy jet-black bob with blunt bangs, warm olive skin, dark brown eyes, small silver nose stud, thin gold hoop earrings, black leather jacket over a white tank top, looking straight into the camera with a confident half smile, two round ring-light reflections in her eyes, a small messy bedroom softly blurred behind her, shot on a phone front camera, candid influencer photo, natural skin texture, sharp face, no text';
const KEEP = ' Keep her face, her jet-black bob with blunt bangs and her nose stud exactly the same. Photorealistic candid photo, natural skin texture, no text.';
const SHOTS = [
  null,
  'A new photo of this exact same woman: day one, sitting cross-legged on the floor of a tiny cluttered bedroom at night, filming herself with her phone clipped to a cheap ring light, a cup of instant noodles beside her, fairy lights on the wall, vertical phone video still.',
  'A new photo of this exact same woman: dancing on a city rooftop at golden hour while filming a short video, wind in her hair, oversized sunglasses pushed up, the skyline behind her.',
  'A new photo of this exact same woman: lounging on a white sofa in a luxury penthouse with floor-to-ceiling windows over a city skyline at night, black designer dress, a glass of champagne, filming herself.',
  'A new photo of this exact same woman: on the deck of a white superyacht in a turquoise Mediterranean harbour, white linen outfit, sunglasses, golden hour, paparazzi photo.',
  'A new photo of this exact same woman: stepping down the stairs of a private jet onto a sunny runway, oversized sunglasses, cream suit, phone in hand, paparazzi photo.',
];
module.exports = async (req, res) => {
  L.setOidc(req);
  const sq = L.query(req).shot;
  if (sq != null && /^[0-5]$/.test(String(sq)) && L.dbReady()) {
    try {
      await L.ready(); const n = Number(sq), fresh = L.query(req).again === '1';
      let r = fresh ? null : (await L.q('SELECT img FROM p0_brand WHERE n=$1', [n]))[0];
      if (!r && !L.limited('shot', 14, 3600000)) {
        let p;
        if (n === 0) p = await L.photo(FACE, null, 55000);
        else {
          const f = (await L.q('SELECT img FROM p0_brand WHERE n=0'))[0];
          if (!f) return L.send(res, 200, { ok: false, error: 'make shot 0 first' });
          p = await L.photo(SHOTS[n] + KEEP, Buffer.from(f.img).toString('base64'), 55000);
        }
        if (!p.ok) return L.send(res, 200, { ok: false, error: p.error });
        const img = await require('sharp')(p.buf).jpeg({ quality: 92 }).toBuffer();
        await L.q('INSERT INTO p0_brand (n, img) VALUES ($1,$2) ON CONFLICT (n) DO UPDATE SET img=EXCLUDED.img, at=now()', [n, img]); r = { img };
      }
      if (!r) return L.send(res, 200, { ok: false, error: 'not made yet' });
      res.statusCode = 200; res.setHeader('Content-Type', 'image/jpeg'); res.setHeader('Cache-Control', 'public, max-age=3600'); res.setHeader('CDN-Cache-Control', 'public, s-maxage=86400'); return res.end(Buffer.from(r.img));
    } catch (e) { return L.send(res, 200, { ok: false, error: String(e && e.message).slice(0, 200) }); }
  }
  L.send(res, 200, { ok: true, records: L.dbReady(), gateway: !!L.gatewayToken(), photos: L.IMG_EDIT });
};
