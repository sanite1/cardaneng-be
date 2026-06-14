import dotenv from 'dotenv';

dotenv.config();

function fromEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: fromEnv('CORS_ORIGIN', '*'),
  mongoUri: fromEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017/cardaneng'),
  jwtSecret: fromEnv('JWT_SECRET', 'dev-secret-change-me'),
  jwtExpires: fromEnv('JWT_EXPIRES', '7d'),
  // Used once to seed the first admin into the Users collection (then ignored).
  adminUser: fromEnv('ADMIN_USER', 'admin'),
  adminPass: fromEnv('ADMIN_PASS', 'cardan2026'),
  cloudinaryCloudName: fromEnv('CLOUDINARY_CLOUD_NAME', ''),
  cloudinaryApiKey: fromEnv('CLOUDINARY_API_KEY', ''),
  cloudinaryApiSecret: fromEnv('CLOUDINARY_API_SECRET', ''),
  cloudinaryFolder: fromEnv('CLOUDINARY_FOLDER', 'cardaneng'),
  smtpHost: fromEnv('SMTP_HOST', ''),
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: fromEnv('SMTP_USER', ''),
  smtpPass: fromEnv('SMTP_PASS', ''),
  mailFrom: fromEnv('MAIL_FROM', 'Cardan Engineering <no-reply@cardaneng.com>'),
  contactRecipient: fromEnv('CONTACT_RECIPIENT', 'info@cardaneng.com'),
  companyName: fromEnv('COMPANY_NAME', 'Cardan Engineering Limited'),
  // Cloudflare Turnstile (optional CAPTCHA). Leave empty to disable.
  turnstileSecret: fromEnv('TURNSTILE_SECRET', ''),
  isProd: process.env.NODE_ENV === 'production',
};
