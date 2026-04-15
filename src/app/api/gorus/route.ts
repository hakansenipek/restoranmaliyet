import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'hakansenipek@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const { mesaj, email } = await req.json() as { mesaj: string; email?: string };

    if (!mesaj || mesaj.trim().length < 5) {
      return NextResponse.json({ error: 'Mesaj çok kısa.' }, { status: 400 });
    }

    await resend.emails.send({
      from: 'restoranmaliyet.com <onboarding@resend.dev>',
      to: ADMIN_EMAIL,
      subject: 'Yeni Görüş / Talep — restoranmaliyet.com',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#5A2D6E">Yeni Görüş / Talep</h2>
          <p><strong>Gönderen:</strong> ${email ? email : '(giriş yapılmamış)'}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
          <p style="white-space:pre-wrap;font-size:15px;color:#111">${mesaj.trim()}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
          <p style="font-size:12px;color:#9ca3af">restoranmaliyet.com — otomatik bildirim</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Görüş gönderim hatası:', err);
    return NextResponse.json({ error: 'Gönderilemedi.' }, { status: 500 });
  }
}
