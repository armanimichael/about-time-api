import { Schema, model, Document, Model } from 'mongoose';
import Joi from 'joi';

interface IUserArgs {
  username: string;
  email: string;
  password: string;
  creation_date?: Date;
}

interface IUser extends Document {}

export class User {
  public model: Model<IUser>;
  private _registerValidation: Joi.ObjectSchema;
  private _loginValidation: Joi.ObjectSchema;

  constructor() {
    const schema = new Schema({
      username: {
        type: String,
        required: true,
        min: 8,
        max: 16,
      },
      email: {
        type: String,
        required: true,
        min: 8,
        max: 255,
      },
      password: {
        type: String,
        required: true,
        min: 8,
        max: 255,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    });

    this.model = model<IUser>('User', schema);

    // Validation
    this._registerValidation = Joi.object({
      username: Joi.string().alphanum().min(8).max(16).required(),
      email: Joi.string().email().min(8).max(255).required(),
      password: Joi.string().min(8).max(255).required(),
      date: Joi.date(),
    });
    this._loginValidation = Joi.object({
      username: Joi.string().alphanum().min(8).max(16),
      email: Joi.string().email().min(8).max(255),
      password: Joi.string().min(8).max(255).required(),
    }).xor('username', 'email');
  }

  createModel(attrs: IUserArgs) {
    return new this.model(attrs);
  }

  validateModel(
    attrs: IUserArgs,
    method: 'register' | 'login' = 'register',
  ): Joi.ValidationError | undefined {
    switch (method) {
      case 'register':
        return this._registerValidation.validate(attrs).error;
      case 'login':
        return this._loginValidation.validate(attrs).error;
    }
  }
}
