import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Env Vars
dotenv.config();

const jwtAuthentication = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('JWT-Auth-Token');

  if (!token)
    return res.status(401).json({ result: 'Unauthorized - Login Required' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = verified;
    next();
  } catch (error) {
    res.status(400).json({ result: 'Invalid Token' });
  }
};

export { jwtAuthentication };
