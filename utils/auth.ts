import { Request } from 'express';
import EmailVerifier from 'email-verifier';
import { Types } from 'mongoose';

interface EmailValidation {
  smtpCheck: string | boolean;
  dnsCheck: string | boolean;
  disposableCheck: string | boolean;
}

const getLoggedUserID = (req: Request): Types.ObjectId => {
  interface SecureRouteRequest extends Request {
    user: {
      _id: Types.ObjectId;
      iat: number;
    };
  }

  return (req as SecureRouteRequest).user._id;
};

const validateEmail = (email: string): Promise<EmailValidation> => {
  const mailVerifier = new EmailVerifier(process.env.EMAIL_VERIFICATION_KEY, {
    validateDNS: true,
    checkDisposable: true,
    validateSMTP: true,
    checkCatchAll: false,
    checkFree: false,
  });

  return new Promise((resolve, reject) => {
    mailVerifier.verify(email, (err: unknown, data: EmailValidation) => {
      err ? reject(err) : resolve(data);
    });
  });
};

export { getLoggedUserID, validateEmail };
