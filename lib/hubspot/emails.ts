import { hubspotRequest } from "./client";

interface EmailEngagementResponse {
  id: string;
}

/**
 * Send a configuration email to the contact via HubSpot
 * Creates an email engagement that logs in HubSpot and sends to the contact
 */
export async function sendConfigurationEmail(
  contactId: string,
  email: string,
  firstName: string,
  reference: string,
  configUrl: string,
  locale: string = "en"
): Promise<string | null> {
  try {
    // Email content based on locale
    const emailContent = getEmailContent(firstName, reference, configUrl, locale);

    // Create an email engagement in HubSpot
    // Note: This logs the email in HubSpot. For actual sending, you'd need
    // HubSpot Marketing Hub or a transactional email service
    const response = await hubspotRequest<EmailEngagementResponse>(
      "/crm/v3/objects/emails",
      {
        method: "POST",
        body: JSON.stringify({
          properties: {
            hs_timestamp: new Date().toISOString(),
            hs_email_direction: "EMAIL",
            hs_email_status: "SENT",
            hs_email_subject: emailContent.subject,
            hs_email_text: emailContent.text,
            hs_email_html: emailContent.html,
            hs_email_to_email: email,
            hs_email_to_firstname: firstName,
          },
          associations: [
            {
              to: { id: contactId },
              types: [
                {
                  associationCategory: "HUBSPOT_DEFINED",
                  associationTypeId: 198, // Email to Contact
                },
              ],
            },
          ],
        }),
      }
    );

    console.log(`Created email engagement ${response.id} for contact ${contactId}`);
    return response.id;
  } catch (error) {
    console.error("Failed to create email engagement:", error);
    return null;
  }
}

interface EmailContent {
  subject: string;
  text: string;
  html: string;
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
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1f2937;">Your FarmDroid Configuration</h2>
  <p>Hi ${firstName},</p>
  <p>Thank you for creating your FarmDroid configuration!</p>
  <p><strong>Your unique configuration reference is:</strong></p>
  <p style="font-size: 24px; font-family: monospace; background: #f3f4f6; padding: 12px; border-radius: 8px; text-align: center;">${reference}</p>
  <p>You can view and modify your configuration at any time:</p>
  <p style="text-align: center;">
    <a href="${configUrl}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Your Configuration</a>
  </p>
  <p style="color: #6b7280; font-size: 14px;">Save this email - you'll need this link to return to your configuration.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="color: #6b7280; font-size: 12px;">Best regards,<br>The FarmDroid Team</p>
</div>`,
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
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1f2937;">Din FarmDroid Konfiguration</h2>
  <p>Hej ${firstName},</p>
  <p>Tak fordi du oprettede din FarmDroid konfiguration!</p>
  <p><strong>Din unikke konfigurationsreference er:</strong></p>
  <p style="font-size: 24px; font-family: monospace; background: #f3f4f6; padding: 12px; border-radius: 8px; text-align: center;">${reference}</p>
  <p>Du kan se og ændre din konfiguration når som helst:</p>
  <p style="text-align: center;">
    <a href="${configUrl}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Se Din Konfiguration</a>
  </p>
  <p style="color: #6b7280; font-size: 14px;">Gem denne email - du skal bruge dette link for at vende tilbage til din konfiguration.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="color: #6b7280; font-size: 12px;">Med venlig hilsen,<br>FarmDroid Teamet</p>
</div>`,
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
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1f2937;">Ihre FarmDroid Konfiguration</h2>
  <p>Hallo ${firstName},</p>
  <p>Vielen Dank für die Erstellung Ihrer FarmDroid Konfiguration!</p>
  <p><strong>Ihre eindeutige Konfigurationsreferenz ist:</strong></p>
  <p style="font-size: 24px; font-family: monospace; background: #f3f4f6; padding: 12px; border-radius: 8px; text-align: center;">${reference}</p>
  <p>Sie können Ihre Konfiguration jederzeit ansehen und ändern:</p>
  <p style="text-align: center;">
    <a href="${configUrl}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Konfiguration Ansehen</a>
  </p>
  <p style="color: #6b7280; font-size: 14px;">Speichern Sie diese E-Mail - Sie benötigen diesen Link, um zu Ihrer Konfiguration zurückzukehren.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="color: #6b7280; font-size: 12px;">Mit freundlichen Grüßen,<br>Das FarmDroid Team</p>
</div>`,
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
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1f2937;">Votre Configuration FarmDroid</h2>
  <p>Bonjour ${firstName},</p>
  <p>Merci d'avoir créé votre configuration FarmDroid !</p>
  <p><strong>Votre référence de configuration unique est :</strong></p>
  <p style="font-size: 24px; font-family: monospace; background: #f3f4f6; padding: 12px; border-radius: 8px; text-align: center;">${reference}</p>
  <p>Vous pouvez consulter et modifier votre configuration à tout moment :</p>
  <p style="text-align: center;">
    <a href="${configUrl}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Voir Votre Configuration</a>
  </p>
  <p style="color: #6b7280; font-size: 14px;">Conservez cet email - vous aurez besoin de ce lien pour revenir à votre configuration.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="color: #6b7280; font-size: 12px;">Cordialement,<br>L'équipe FarmDroid</p>
</div>`,
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
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1f2937;">Uw FarmDroid Configuratie</h2>
  <p>Hallo ${firstName},</p>
  <p>Bedankt voor het maken van uw FarmDroid configuratie!</p>
  <p><strong>Uw unieke configuratiereferentie is:</strong></p>
  <p style="font-size: 24px; font-family: monospace; background: #f3f4f6; padding: 12px; border-radius: 8px; text-align: center;">${reference}</p>
  <p>U kunt uw configuratie op elk moment bekijken en wijzigen:</p>
  <p style="text-align: center;">
    <a href="${configUrl}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Bekijk Uw Configuratie</a>
  </p>
  <p style="color: #6b7280; font-size: 14px;">Bewaar deze email - u heeft deze link nodig om terug te keren naar uw configuratie.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="color: #6b7280; font-size: 12px;">Met vriendelijke groet,<br>Het FarmDroid Team</p>
</div>`,
    },
  };

  return translations[locale] || translations.en;
}
