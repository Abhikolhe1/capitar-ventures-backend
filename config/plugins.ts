import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedTypes = [
  'image/svg+xml',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
      },
    },
  },
  upload: {
    config: {
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
    },
  },
  // Outgoing mail (newsletter) is sent through the mailbox set in .env. Without
  // SMTP_HOST nothing is sent and new-article emails are skipped with a log line.
  ...(env('SMTP_HOST')
    ? {
        email: {
          config: {
            provider: 'nodemailer',
            providerOptions: {
              host: env('SMTP_HOST'),
              port: env.int('SMTP_PORT', 587),
              // true for port 465 (SSL); false for 587, which upgrades with STARTTLS.
              secure: env.bool('SMTP_SECURE', false),
              auth: { user: env('SMTP_USERNAME'), pass: env('SMTP_PASSWORD') },
              pool: true,
              maxConnections: 2,
            },
            settings: {
              defaultFrom: env('SMTP_FROM', env('SMTP_USERNAME')),
              defaultReplyTo: env('SMTP_REPLY_TO', env('SMTP_FROM', env('SMTP_USERNAME'))),
            },
          },
        },
      }
    : {}),
});

export default config;
