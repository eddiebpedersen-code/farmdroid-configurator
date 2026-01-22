import sgMail from "@sendgrid/mail";

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

/**
 * Send a configuration email to the user via SendGrid
 */
export async function sendConfigurationEmail(
  email: string,
  firstName: string,
  reference: string,
  configUrl: string,
  locale: string = "en"
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY not configured, skipping email");
    return false;
  }

  try {
    const content = getEmailContent(firstName, reference, configUrl, locale);

    await sgMail.send({
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || "noreply@farmdroid.com",
        name: "FarmDroid",
      },
      subject: content.subject,
      text: content.text,
      html: content.html,
    });

    console.log(`Configuration email sent to ${email} for reference ${reference}`);
    return true;
  } catch (error) {
    console.error("Failed to send configuration email:", error);
    return false;
  }
}

function getEmailContent(
  firstName: string,
  reference: string,
  configUrl: string,
  locale: string
): EmailContent {
  const translations: Record<string, EmailContent> = {
    en: {
      subject: `Your FarmDroid Configuration - ${reference}`,
      text: `Hi ${firstName},

Thank you for creating your FarmDroid configuration!

Your unique configuration reference is: ${reference}

You can view and modify your configuration at any time using this link:
${configUrl}

Save this email - you'll need this link to return to your configuration.

Best regards,
The FarmDroid Team`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f4;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin-top: 0;">Your FarmDroid Configuration</h2>
    <p style="color: #374151;">Hi ${firstName},</p>
    <p style="color: #374151;">Thank you for creating your FarmDroid configuration!</p>
    <p style="color: #374151;"><strong>Your unique configuration reference is:</strong></p>
    <p style="font-size: 28px; font-family: monospace; background: #e8f5e4; padding: 16px; border-radius: 8px; text-align: center; color: #5ab147; font-weight: bold; margin: 24px 0;">${reference}</p>
    <p style="color: #374151;">You can view and modify your configuration at any time:</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${configUrl}" style="display: inline-block; background: #5ab147; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Your Configuration</a>
    </p>
    <p style="color: #6b7280; font-size: 14px;">Save this email - you'll need this link to return to your configuration.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #6b7280; font-size: 12px;">Best regards,<br>The FarmDroid Team</p>
  </div>
</body>
</html>`,
    },
    da: {
      subject: `Din FarmDroid Konfiguration - ${reference}`,
      text: `Hej ${firstName},

Tak fordi du oprettede din FarmDroid konfiguration!

Din unikke konfigurationsreference er: ${reference}

Du kan se og ændre din konfiguration når som helst via dette link:
${configUrl}

Gem denne email - du skal bruge dette link for at vende tilbage til din konfiguration.

Med venlig hilsen,
FarmDroid Teamet`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f4;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin-top: 0;">Din FarmDroid Konfiguration</h2>
    <p style="color: #374151;">Hej ${firstName},</p>
    <p style="color: #374151;">Tak fordi du oprettede din FarmDroid konfiguration!</p>
    <p style="color: #374151;"><strong>Din unikke konfigurationsreference er:</strong></p>
    <p style="font-size: 28px; font-family: monospace; background: #e8f5e4; padding: 16px; border-radius: 8px; text-align: center; color: #5ab147; font-weight: bold; margin: 24px 0;">${reference}</p>
    <p style="color: #374151;">Du kan se og ændre din konfiguration når som helst:</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${configUrl}" style="display: inline-block; background: #5ab147; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Se Din Konfiguration</a>
    </p>
    <p style="color: #6b7280; font-size: 14px;">Gem denne email - du skal bruge dette link for at vende tilbage til din konfiguration.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #6b7280; font-size: 12px;">Med venlig hilsen,<br>FarmDroid Teamet</p>
  </div>
</body>
</html>`,
    },
    de: {
      subject: `Ihre FarmDroid Konfiguration - ${reference}`,
      text: `Hallo ${firstName},

Vielen Dank für die Erstellung Ihrer FarmDroid Konfiguration!

Ihre eindeutige Konfigurationsreferenz ist: ${reference}

Sie können Ihre Konfiguration jederzeit über diesen Link ansehen und ändern:
${configUrl}

Speichern Sie diese E-Mail - Sie benötigen diesen Link, um zu Ihrer Konfiguration zurückzukehren.

Mit freundlichen Grüßen,
Das FarmDroid Team`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f4;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin-top: 0;">Ihre FarmDroid Konfiguration</h2>
    <p style="color: #374151;">Hallo ${firstName},</p>
    <p style="color: #374151;">Vielen Dank für die Erstellung Ihrer FarmDroid Konfiguration!</p>
    <p style="color: #374151;"><strong>Ihre eindeutige Konfigurationsreferenz ist:</strong></p>
    <p style="font-size: 28px; font-family: monospace; background: #e8f5e4; padding: 16px; border-radius: 8px; text-align: center; color: #5ab147; font-weight: bold; margin: 24px 0;">${reference}</p>
    <p style="color: #374151;">Sie können Ihre Konfiguration jederzeit ansehen und ändern:</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${configUrl}" style="display: inline-block; background: #5ab147; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Konfiguration Ansehen</a>
    </p>
    <p style="color: #6b7280; font-size: 14px;">Speichern Sie diese E-Mail - Sie benötigen diesen Link, um zu Ihrer Konfiguration zurückzukehren.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #6b7280; font-size: 12px;">Mit freundlichen Grüßen,<br>Das FarmDroid Team</p>
  </div>
</body>
</html>`,
    },
    fr: {
      subject: `Votre Configuration FarmDroid - ${reference}`,
      text: `Bonjour ${firstName},

Merci d'avoir créé votre configuration FarmDroid !

Votre référence de configuration unique est : ${reference}

Vous pouvez consulter et modifier votre configuration à tout moment via ce lien :
${configUrl}

Conservez cet email - vous aurez besoin de ce lien pour revenir à votre configuration.

Cordialement,
L'équipe FarmDroid`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f4;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin-top: 0;">Votre Configuration FarmDroid</h2>
    <p style="color: #374151;">Bonjour ${firstName},</p>
    <p style="color: #374151;">Merci d'avoir créé votre configuration FarmDroid !</p>
    <p style="color: #374151;"><strong>Votre référence de configuration unique est :</strong></p>
    <p style="font-size: 28px; font-family: monospace; background: #e8f5e4; padding: 16px; border-radius: 8px; text-align: center; color: #5ab147; font-weight: bold; margin: 24px 0;">${reference}</p>
    <p style="color: #374151;">Vous pouvez consulter et modifier votre configuration à tout moment :</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${configUrl}" style="display: inline-block; background: #5ab147; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Voir Votre Configuration</a>
    </p>
    <p style="color: #6b7280; font-size: 14px;">Conservez cet email - vous aurez besoin de ce lien pour revenir à votre configuration.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #6b7280; font-size: 12px;">Cordialement,<br>L'équipe FarmDroid</p>
  </div>
</body>
</html>`,
    },
    nl: {
      subject: `Uw FarmDroid Configuratie - ${reference}`,
      text: `Hallo ${firstName},

Bedankt voor het maken van uw FarmDroid configuratie!

Uw unieke configuratiereferentie is: ${reference}

U kunt uw configuratie op elk moment bekijken en wijzigen via deze link:
${configUrl}

Bewaar deze email - u heeft deze link nodig om terug te keren naar uw configuratie.

Met vriendelijke groet,
Het FarmDroid Team`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f4;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin-top: 0;">Uw FarmDroid Configuratie</h2>
    <p style="color: #374151;">Hallo ${firstName},</p>
    <p style="color: #374151;">Bedankt voor het maken van uw FarmDroid configuratie!</p>
    <p style="color: #374151;"><strong>Uw unieke configuratiereferentie is:</strong></p>
    <p style="font-size: 28px; font-family: monospace; background: #e8f5e4; padding: 16px; border-radius: 8px; text-align: center; color: #5ab147; font-weight: bold; margin: 24px 0;">${reference}</p>
    <p style="color: #374151;">U kunt uw configuratie op elk moment bekijken en wijzigen:</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${configUrl}" style="display: inline-block; background: #5ab147; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Bekijk Uw Configuratie</a>
    </p>
    <p style="color: #6b7280; font-size: 14px;">Bewaar deze email - u heeft deze link nodig om terug te keren naar uw configuratie.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #6b7280; font-size: 12px;">Met vriendelijke groet,<br>Het FarmDroid Team</p>
  </div>
</body>
</html>`,
    },
  };

  return translations[locale] || translations.en;
}

/**
 * Send a verification code email to the user via SendGrid
 */
export async function sendVerificationCodeEmail(
  email: string,
  code: string,
  locale: string = "en"
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY not configured, skipping verification email");
    return false;
  }

  try {
    const content = getVerificationEmailContent(code, locale);

    await sgMail.send({
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || "noreply@farmdroid.com",
        name: "FarmDroid",
      },
      subject: content.subject,
      text: content.text,
      html: content.html,
    });

    console.log(`Verification code email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Failed to send verification code email:", error);
    return false;
  }
}

function getVerificationEmailContent(
  code: string,
  locale: string
): EmailContent {
  const translations: Record<string, EmailContent> = {
    en: {
      subject: `Your FarmDroid Verification Code: ${code}`,
      text: `Your verification code is: ${code}

This code expires in 10 minutes.

If you didn't request this code, you can safely ignore this email.

Best regards,
The FarmDroid Team`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f4;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin-top: 0;">Your Verification Code</h2>
    <p style="color: #374151;">Your verification code is:</p>
    <p style="font-size: 36px; font-family: monospace; background: #e8f5e4; padding: 20px; border-radius: 8px; text-align: center; color: #5ab147; font-weight: bold; margin: 24px 0; letter-spacing: 8px;">${code}</p>
    <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
    <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #6b7280; font-size: 12px;">Best regards,<br>The FarmDroid Team</p>
  </div>
</body>
</html>`,
    },
    da: {
      subject: `Din FarmDroid Verifikationskode: ${code}`,
      text: `Din verifikationskode er: ${code}

Denne kode udløber om 10 minutter.

Hvis du ikke har anmodet om denne kode, kan du roligt ignorere denne email.

Med venlig hilsen,
FarmDroid Teamet`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f4;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin-top: 0;">Din Verifikationskode</h2>
    <p style="color: #374151;">Din verifikationskode er:</p>
    <p style="font-size: 36px; font-family: monospace; background: #e8f5e4; padding: 20px; border-radius: 8px; text-align: center; color: #5ab147; font-weight: bold; margin: 24px 0; letter-spacing: 8px;">${code}</p>
    <p style="color: #6b7280; font-size: 14px;">Denne kode udløber om 10 minutter.</p>
    <p style="color: #6b7280; font-size: 14px;">Hvis du ikke har anmodet om denne kode, kan du roligt ignorere denne email.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #6b7280; font-size: 12px;">Med venlig hilsen,<br>FarmDroid Teamet</p>
  </div>
</body>
</html>`,
    },
    de: {
      subject: `Ihr FarmDroid Verifizierungscode: ${code}`,
      text: `Ihr Verifizierungscode ist: ${code}

Dieser Code läuft in 10 Minuten ab.

Wenn Sie diesen Code nicht angefordert haben, können Sie diese E-Mail ignorieren.

Mit freundlichen Grüßen,
Das FarmDroid Team`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f4;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin-top: 0;">Ihr Verifizierungscode</h2>
    <p style="color: #374151;">Ihr Verifizierungscode ist:</p>
    <p style="font-size: 36px; font-family: monospace; background: #e8f5e4; padding: 20px; border-radius: 8px; text-align: center; color: #5ab147; font-weight: bold; margin: 24px 0; letter-spacing: 8px;">${code}</p>
    <p style="color: #6b7280; font-size: 14px;">Dieser Code läuft in 10 Minuten ab.</p>
    <p style="color: #6b7280; font-size: 14px;">Wenn Sie diesen Code nicht angefordert haben, können Sie diese E-Mail ignorieren.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #6b7280; font-size: 12px;">Mit freundlichen Grüßen,<br>Das FarmDroid Team</p>
  </div>
</body>
</html>`,
    },
    fr: {
      subject: `Votre Code de Vérification FarmDroid: ${code}`,
      text: `Votre code de vérification est : ${code}

Ce code expire dans 10 minutes.

Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.

Cordialement,
L'équipe FarmDroid`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f4;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin-top: 0;">Votre Code de Vérification</h2>
    <p style="color: #374151;">Votre code de vérification est :</p>
    <p style="font-size: 36px; font-family: monospace; background: #e8f5e4; padding: 20px; border-radius: 8px; text-align: center; color: #5ab147; font-weight: bold; margin: 24px 0; letter-spacing: 8px;">${code}</p>
    <p style="color: #6b7280; font-size: 14px;">Ce code expire dans 10 minutes.</p>
    <p style="color: #6b7280; font-size: 14px;">Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #6b7280; font-size: 12px;">Cordialement,<br>L'équipe FarmDroid</p>
  </div>
</body>
</html>`,
    },
    nl: {
      subject: `Uw FarmDroid Verificatiecode: ${code}`,
      text: `Uw verificatiecode is: ${code}

Deze code verloopt over 10 minuten.

Als u deze code niet heeft aangevraagd, kunt u deze email negeren.

Met vriendelijke groet,
Het FarmDroid Team`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f4;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #1f2937; margin-top: 0;">Uw Verificatiecode</h2>
    <p style="color: #374151;">Uw verificatiecode is:</p>
    <p style="font-size: 36px; font-family: monospace; background: #e8f5e4; padding: 20px; border-radius: 8px; text-align: center; color: #5ab147; font-weight: bold; margin: 24px 0; letter-spacing: 8px;">${code}</p>
    <p style="color: #6b7280; font-size: 14px;">Deze code verloopt over 10 minuten.</p>
    <p style="color: #6b7280; font-size: 14px;">Als u deze code niet heeft aangevraagd, kunt u deze email negeren.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #6b7280; font-size: 12px;">Met vriendelijke groet,<br>Het FarmDroid Team</p>
  </div>
</body>
</html>`,
    },
  };

  return translations[locale] || translations.en;
}
