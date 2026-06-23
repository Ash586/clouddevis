/**
 * Simple server-side i18n for API error messages.
 * Determines language from the Accept-Language header.
 */

type Translations = Record<string, Record<string, string>>;

const MESSAGES: Translations = {
  fr: {
    rateLimit: "Trop de tentatives. Réessayez dans une minute.",
    unauthorized: "Non authentifié",
    emailTaken: "Cet email est déjà utilisé",
    invalidCredentials: "Email ou mot de passe incorrect",
    userSuspended: "Votre compte a été suspendu. Contactez le support.",
    emailRequired: "Email requis",
    tokenPasswordRequired: "Token et mot de passe requis",
    passwordTooShort: "Mot de passe trop court (min 6 caractères)",
    tokenInvalid: "Token invalide",
    tokenUsed: "Token déjà utilisé",
    tokenExpired: "Token expiré",
    passwordResetSuccess: "Mot de passe réinitialisé avec succès",
  },
  en: {
    rateLimit: "Too many attempts. Please try again in a minute.",
    unauthorized: "Not authenticated",
    emailTaken: "This email is already in use",
    invalidCredentials: "Invalid email or password",
    userSuspended: "Your account has been suspended. Please contact support.",
    emailRequired: "Email is required",
    tokenPasswordRequired: "Token and password required",
    passwordTooShort: "Password too short (min 6 characters)",
    tokenInvalid: "Invalid token",
    tokenUsed: "Token already used",
    tokenExpired: "Token expired",
    passwordResetSuccess: "Password successfully reset",
  },
  ar: {
    rateLimit: "محاولات كثيرة جداً. حاول مرة أخرى بعد دقيقة.",
    unauthorized: "غير مصرح",
    emailTaken: "هذا البريد الإلكتروني مستخدم بالفعل",
    invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    userSuspended: "تم تعليق حسابك. يرجى الاتصال بالدعم.",
    emailRequired: "البريد الإلكتروني مطلوب",
    tokenPasswordRequired: "الرمز وكلمة المرور مطلوبان",
    passwordTooShort: "كلمة المرور قصيرة جداً (6 أحرف على الأقل)",
    tokenInvalid: "رمز غير صالح",
    tokenUsed: "الرمز مستخدم بالفعل",
    tokenExpired: "الرمز منتهي الصلاحية",
    passwordResetSuccess: "تم إعادة تعيين كلمة المرور بنجاح",
  },
};

export function getLang(req: Request): string {
  const acceptLang = req.headers.get('accept-language') || 'fr';
  if (acceptLang.startsWith('ar')) return 'ar';
  if (acceptLang.startsWith('en')) return 'en';
  return 'fr';
}

export function t(req: Request, key: string): string {
  const lang = getLang(req);
  return MESSAGES[lang]?.[key] || MESSAGES['fr'][key] || key;
}
