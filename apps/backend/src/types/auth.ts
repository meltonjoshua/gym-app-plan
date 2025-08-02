import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    stripeCustomerId?: string;
  };
}

export interface IUser {
  _id: string;
  email: string;
  name: string;
  role: string;
  stripeCustomerId?: string;
}
