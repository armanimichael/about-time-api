import { Request } from 'express';
import { Types } from 'mongoose';

const getLoggedUserID = (req: Request): Types.ObjectId => {
  interface SecureRouteRequest extends Request {
    user: {
      _id: Types.ObjectId;
      iat: number;
    };
  }

  return (req as SecureRouteRequest).user._id;
};

export { getLoggedUserID };
