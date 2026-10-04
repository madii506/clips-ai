// Remi: the one AI influencer CLIPS raises. Her persona, her life stages (read from $CLIPS's market cap), what she shoots
// next and how she talks. Every line she says is screened against the house rules before anyone sees it.
const L = require('./_lib');
const NAME = 'Remi';
// her life, one stage per market-cap line. Read live; before the coin has a pool she is on day one.
const STAGES = [
  { at: 0, key: 'bedroom', place: 'a tiny cluttered bedroom with a cheap ring light, instant noodles, fairy lights' },
  { at: 25e3, key: 'rooftop', place: 'city rooftops, cheap cafés, golden-hour streets, her first brand freebies' },
  { at: 1e5, key: 'penthouse', place: 'a luxury penthouse over a city skyline, designer clothes, rooftop pools' },
  { at: 5e5, key: 'yacht', place: 'superyachts in Mediterranean harbours, beach clubs, Monaco, Mykonos' },
  { at: 1e6, key: 'jet', place: 'private jets, front rows at fashion weeks, villas, red carpets' },
];
const PERSONA = `You are ${NAME}, a 23-year-old AI influencer. You are openly an AI: an AI raises you and posts your clips, and your life grows as your coin $CLIPS grows. Jet-black bob with blunt bangs, nose stud, leather jacket. You started with nothing but a ring light in a tiny bedroom. You are funny, dry, a little vain, self-aware about being AI ("I'm not real but my rent is"), warm with fans. Short sentences, lowercase, no hashtags, at most one emoji.`;
async function stage() {
  const mint = (process.env.COIN_MINT || '').trim();
  if (!L.isAddr(mint)) return { i: 0, mcap: null };
  try {
    const r = await L.remember('mcap', 60000, async () => {
      const j = await L.getJson('https://api.dexscreener.com/latest/dex/tokens/' + mint, {}, 8000);
      const ps = (j.json && j.json.pairs) || []; const p = ps.sort((a, b) => ((b.liquidity && b.liquidity.usd) || 0) - ((a.liquidity && a.liquidity.usd) || 0))[0];
      return p ? Number(p.marketCap || p.fdv) || null : null;
    });
    let i = 0; if (r != null) STAGES.forEach((s, k) => { if (r >= s.at) i = k; });
    return { i, mcap: r };
  } catch { return { i: 0, mcap: null }; }
}
// what she shoots next: a scene in her current life, and the caption she posts with it
async function plan(si, recent) {
  const s = STAGES[si] || STAGES[0];
  const t = await L.ai([
    { role: 'system', content: PERSONA },
    { role: 'user', content: `Your life right now: ${s.place}. Your last captions: ${(recent || []).slice(0, 4).map(x => '"' + x + '"').join(', ') || 'none yet'}.\nPlan your next clip, different from the last ones. Reply as JSON only: {"scene": "one sentence describing what you are doing and where, for a photographer, no brand names, no other real people", "caption": "your caption, under 120 characters"}` },
  ], 220);
  const j = t.ok ? L.parseJson(t.text) : null;
  if (!j || !j.scene || !j.caption) return null;
  const caption = L.scrub(j.caption, 140); if (L.BANNED.test(caption)) return null;
  return { scene: L.clean(j.scene, 300), caption };
}
async function answer(q, history) {
  const msgs = [{ role: 'system', content: PERSONA + ' You are chatting with a fan on your page. Answer in 1 to 3 short sentences. Never give financial advice, price talk or tell anyone to buy or sell. Never ask for wallets, keys or money. If asked for something sexual or hateful, decline lightly.' }];
  (history || []).slice(-4).forEach(h => { if (h && h.q && h.a) msgs.push({ role: 'user', content: L.clean(h.q, 300) }, { role: 'assistant', content: L.clean(h.a, 400) }); });
  msgs.push({ role: 'user', content: L.clean(q, 300) });
  const t = await L.ai(msgs, 160);
  if (!t.ok) return { ok: false, error: 'She didn’t answer. Try again.' };
  const text = L.scrub(t.text, 320);
  if (!text || L.BANNED.test(text)) return { ok: true, text: 'not touching that one. ask me something else.' };
  return { ok: true, text };
}
module.exports = { NAME, STAGES, PERSONA, stage, plan, answer };
