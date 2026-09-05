// @ts-ignore - nodemailer has no type declarations in this project
import nodemailer from "nodemailer";
import {
  buildCreatorLeadConfirmationEmail,
  buildCreatorLeadOwnerEmail,
  type CreatorLeadEmailData,
} from "./emailTemplates";

export type CreatorEmailEnvironment = Record<string, string | undefined>;

export type CreatorEmailConfiguration = {
  smtpUser: string;
  smtpPassword: string;
  from: string;
  adminEmail: string;
  frontendUrl: string;
};

export type CreatorMailMessage = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

export type CreatorMailTransport = {
  sendMail(message: CreatorMailMessage): Promise<unknown>;
};

export type CreatorEmailDeliveryStatus = "sent" | "suppressed" | "failed";

export type CreatorEmailDeliveryResult = {
  status: CreatorEmailDeliveryStatus;
  admin: CreatorEmailDeliveryStatus;
  creator: CreatorEmailDeliveryStatus;
  missingVariables: string[];
  failures: Array<{ recipient: "admin" | "creator"; reason: string }>;
};

function required(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** The Creator email gate defaults closed and is independent of lead capture. */
export function creatorEmailSendingEnabled(environment: CreatorEmailEnvironment = process.env): boolean {
  return environment.CREATOR_EMAIL_SENDING_ENABLED === "true";
}

/**
 * SMTP credentials are technical transport inputs only. All sender identity,
 * recipients, links, and Creator branding come from ZAKHY_* configuration.
 */
export function getCreatorEmailConfiguration(
  environment: CreatorEmailEnvironment = process.env,
): { configuration: CreatorEmailConfiguration | null; missingVariables: string[] } {
  const values = {
    EMAIL_USER: required(environment.EMAIL_USER),
    EMAIL_PASSWORD: required(environment.EMAIL_PASSWORD),
    ZAKHY_EMAIL_FROM: required(environment.ZAKHY_EMAIL_FROM),
    ZAKHY_ADMIN_EMAIL: required(environment.ZAKHY_ADMIN_EMAIL),
    ZAKHY_FRONTEND_URL: required(environment.ZAKHY_FRONTEND_URL),
  };
  const missingVariables = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVariables.length > 0) return { configuration: null, missingVariables };

  return {
    configuration: {
      smtpUser: values.EMAIL_USER!,
      smtpPassword: values.EMAIL_PASSWORD!,
      from: values.ZAKHY_EMAIL_FROM!,
      adminEmail: values.ZAKHY_ADMIN_EMAIL!,
      frontendUrl: values.ZAKHY_FRONTEND_URL!,
    },
    missingVariables: [],
  };
}

function publicFailureReason(error: unknown): string {
  const message = error instanceof Error ? error.message : "mail transport failure";
  return message.slice(0, 300);
}

function createTransport(configuration: CreatorEmailConfiguration): CreatorMailTransport {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: configuration.smtpUser,
      pass: configuration.smtpPassword,
    },
  }) as CreatorMailTransport;
}

/**
 * Attempts each message independently. This function never throws: a saved
 * Creator lead must remain accepted even if SMTP or configuration fails.
 */
export async function deliverCreatorLeadEmails(
  lead: CreatorLeadEmailData,
  options: {
    environment?: CreatorEmailEnvironment;
    transport?: CreatorMailTransport;
  } = {},
): Promise<CreatorEmailDeliveryResult> {
  const environment = options.environment ?? process.env;
  if (!creatorEmailSendingEnabled(environment)) {
    return {
      status: "suppressed",
      admin: "suppressed",
      creator: "suppressed",
      missingVariables: [],
      failures: [],
    };
  }

  const { configuration, missingVariables } = getCreatorEmailConfiguration(environment);
  if (!configuration) {
    return {
      status: "failed",
      admin: "failed",
      creator: "failed",
      missingVariables,
      failures: [
        { recipient: "admin", reason: "Creator email configuration is incomplete." },
        { recipient: "creator", reason: "Creator email configuration is incomplete." },
      ],
    };
  }

  let transport: CreatorMailTransport;
  try {
    transport = options.transport ?? createTransport(configuration);
  } catch (error) {
    const reason = publicFailureReason(error);
    return {
      status: "failed",
      admin: "failed",
      creator: "failed",
      missingVariables: [],
      failures: [
        { recipient: "admin", reason },
        { recipient: "creator", reason },
      ],
    };
  }

  const adminUrl = `${configuration.frontendUrl.replace(/\/$/, "")}/admin/creator/leads?lead=${lead.leadId}`;
  const adminMessage = buildCreatorLeadOwnerEmail(lead, adminUrl);
  const creatorMessage = buildCreatorLeadConfirmationEmail(lead);
  const failures: CreatorEmailDeliveryResult["failures"] = [];
  let admin: CreatorEmailDeliveryStatus = "sent";
  let creator: CreatorEmailDeliveryStatus = "sent";

  try {
    await transport.sendMail({
      from: `"Zakhy Builds AI" <${configuration.from}>`,
      to: configuration.adminEmail,
      subject: adminMessage.subject,
      html: adminMessage.html,
    });
  } catch (error) {
    admin = "failed";
    failures.push({ recipient: "admin", reason: publicFailureReason(error) });
  }

  try {
    await transport.sendMail({
      from: `"Zakhy Builds AI" <${configuration.from}>`,
      to: lead.email,
      subject: creatorMessage.subject,
      html: creatorMessage.html,
    });
  } catch (error) {
    creator = "failed";
    failures.push({ recipient: "creator", reason: publicFailureReason(error) });
  }

  return {
    status: failures.length === 0 ? "sent" : "failed",
    admin,
    creator,
    missingVariables: [],
    failures,
  };
}
