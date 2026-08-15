import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface InvitationEmailPayload {
  invitationId: string;
  email: string;
  childName: string;
  parentName: string;
  code: string;
}

function buildInvitationEmail(childName: string, parentName: string, code: string) {
  const activationUrl = `https://opendaycare.app/auth/activar-cuenta?code=${code}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin: 0; padding: 0; background-color: #FBF4EC; font-family: 'Nunito', sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FBF4EC; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; border: 1.5px solid #ECE0D0; overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="padding: 28px 32px 20px; border-bottom: 1px solid #ECE0D0;">
                    <h1 style="margin: 0; font-family: 'Fredoka', sans-serif; font-size: 22px; font-weight: 600; color: #3F362E;">
                      OpenDayCare
                    </h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 28px 32px;">
                    <p style="margin: 0 0 16px; font-size: 16px; color: #3F362E; line-height: 1.5;">
                      Hola <strong>${parentName}</strong>,
                    </p>
                    <p style="margin: 0 0 20px; font-size: 15px; color: #3F362E; line-height: 1.6;">
                      Te invitaron a seguir el día de <strong>${childName}</strong> en la guardería. Creá tu contraseña para activar tu cuenta y empezar a ver el feed.
                    </p>
                    <!-- Code box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: #FBF1D6; border: 1.5px dashed #E6D08A; border-radius: 12px; padding: 20px; text-align: center;">
                          <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.7px; color: #A88526; margin-bottom: 8px;">
                            CÓDIGO DE INVITACIÓN
                          </div>
                          <div style="font-family: 'Fredoka', sans-serif; font-size: 32px; font-weight: 600; letter-spacing: 6px; color: #8A7234;">
                            ${code}
                          </div>
                          <div style="font-size: 12px; color: #A88526; margin-top: 6px;">
                            Vence en 7 días
                          </div>
                        </td>
                      </tr>
                    </table>
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${activationUrl}" style="display: inline-block; background: linear-gradient(180deg, #F4977E, #EE8164); color: #FFFFFF; font-weight: 800; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 14px; box-shadow: 0 10px 22px -8px rgba(238,129,100,0.7);">
                            Activar mi cuenta
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding: 16px 32px 24px; border-top: 1px solid #ECE0D0;">
                    <p style="margin: 0; font-size: 12px; color: #A89A8B; text-align: center; line-height: 1.5;">
                      Si no esperabas este correo, podés ignorarlo.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body: InvitationEmailPayload = await request.json();
    const { invitationId, email, childName, parentName, code } = body;

    if (!invitationId || !email || !childName || !parentName || !code) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "OpenDayCare <invitaciones@resend.dev>",
      to: [email],
      subject: `Invitación a OpenDayCare - Seguí el día de ${childName}`,
      html: buildInvitationEmail(childName, parentName, code),
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch {
    return NextResponse.json(
      { error: "Error al enviar el correo" },
      { status: 500 }
    );
  }
}
