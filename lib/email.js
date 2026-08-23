const FROM = process.env.MAIL_FROM || 'Merit Comp <onboarding@resend.dev>';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || '';

export async function sendMail({ to, subject, heading, lines, cta }) {
  const key = process.env.RESEND_API_KEY;
  const body = `
  <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;background:#f5f4f1;padding:28px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #ecebe6;border-radius:14px;padding:26px">
      <div style="font-size:11px;font-weight:700;letter-spacing:.1em;color:#9a9eaa">MERIT ROOFING · VARIABLE COMP</div>
      <div style="font-size:19px;font-weight:700;color:#1b1d29;margin:8px 0 14px">${heading}</div>
      ${(lines || []).map((l) => `<p style="font-size:14px;line-height:1.6;color:#4a4e5c;margin:0 0 10px">${l}</p>`).join('')}
      ${cta && SITE ? `<a href="${SITE}${cta.href}" style="display:inline-block;margin-top:12px;padding:11px 18px;border-radius:9px;background:#5f7a4e;color:#fff;font-weight:700;font-size:14px;text-decoration:none">${cta.label}</a>` : ''}
    </div>
  </div>`;

  if (!key) { console.log('[email skipped — no RESEND_API_KEY]', to, subject); return; }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: Array.isArray(to) ? to : [to], subject, html: body }),
    });
    if (!res.ok) console.error('[email failed]', await res.text());
  } catch (err) {
    console.error('[email error]', err);
  }
}
