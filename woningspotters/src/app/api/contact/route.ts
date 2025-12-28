import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const contactEmail = process.env.CONTACT_EMAIL || 'info@woningspotters.nl';

interface ContactFormData {
  naam: string;
  email: string;
  onderwerp: string;
  bericht: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    // Validate required fields
    if (!body.naam || !body.email || !body.onderwerp || !body.bericht) {
      return NextResponse.json(
        { error: 'Alle velden zijn verplicht' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!body.email.includes('@')) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres' },
        { status: 400 }
      );
    }

    // Map subject values to readable text
    const onderwerpMap: Record<string, string> = {
      vraag: 'Algemene vraag',
      feedback: 'Feedback',
      bug: 'Bug of probleem',
      account: 'Account & abonnement',
      samenwerking: 'Samenwerking / Zakelijk',
      anders: 'Anders',
    };

    const onderwerpText = onderwerpMap[body.onderwerp] || body.onderwerp;

    // Send email with Resend
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);

      // Send notification to support team
      await resend.emails.send({
        from: 'WoningSpotters Contact <noreply@woningspotters.nl>',
        to: contactEmail,
        replyTo: body.email,
        subject: `[Contact] ${onderwerpText} - ${body.naam}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #FF7A00 0%, #FF9933 100%); padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Nieuw contactformulier bericht</h1>
    </div>

    <div style="padding: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 600; width: 120px;">Naam:</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee;">${body.naam}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 600;">Email:</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
            <a href="mailto:${body.email}" style="color: #FF7A00;">${body.email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 600;">Onderwerp:</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee;">${onderwerpText}</td>
        </tr>
      </table>

      <div style="margin-top: 20px;">
        <h3 style="margin: 0 0 12px; font-size: 14px; color: #666;">Bericht:</h3>
        <div style="background: #f9f9f9; padding: 16px; border-radius: 6px; white-space: pre-wrap; line-height: 1.6;">
${body.bericht}
        </div>
      </div>

      <div style="margin-top: 24px; text-align: center;">
        <a href="mailto:${body.email}?subject=Re: ${onderwerpText}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #FF7A00 0%, #FF9933 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Beantwoorden
        </a>
      </div>
    </div>

    <div style="background: #f5f5f5; padding: 16px; text-align: center; font-size: 12px; color: #666;">
      Dit bericht is verzonden via het contactformulier op woningspotters.nl
    </div>
  </div>
</body>
</html>
        `,
      });

      // Send confirmation to user
      await resend.emails.send({
        from: 'WoningSpotters <noreply@woningspotters.nl>',
        to: body.email,
        subject: 'We hebben je bericht ontvangen - WoningSpotters',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #1a1a2e; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
    <div style="padding: 40px 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px;">Bedankt voor je bericht!</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 16px; margin: 0;">We hebben je bericht goed ontvangen</p>
    </div>

    <div style="padding: 20px 40px;">
      <p style="color: rgba(255,255,255,0.8); font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        Hallo ${body.naam},
      </p>
      <p style="color: rgba(255,255,255,0.8); font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        Bedankt dat je contact met ons hebt opgenomen. We hebben je bericht ontvangen en zullen zo snel mogelijk reageren, meestal binnen 24 uur op werkdagen.
      </p>

      <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin: 0 0 8px;">Je bericht:</p>
        <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; white-space: pre-wrap;">${body.bericht}</p>
      </div>
    </div>

    <div style="padding: 0 40px 30px;">
      <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 0 0 20px;">
      <p style="color: rgba(255,255,255,0.4); font-size: 12px; text-align: center; margin: 0;">
        Dit is een automatisch gegenereerd bericht. Reageer niet op deze email.
      </p>
    </div>
  </div>
</body>
</html>
        `,
      });

      return NextResponse.json({ success: true });
    } else {
      // If Resend is not configured, log the message
      console.log('Contact form submission (Resend not configured):', body);
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het verzenden. Probeer het opnieuw.' },
      { status: 500 }
    );
  }
}
