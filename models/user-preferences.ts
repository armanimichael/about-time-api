import { Schema, model, Document, Model, Types } from 'mongoose';
import Joi from 'joi';

interface IUserPreferencesValidationArgs {
  pushNotifications?: {
    system?: boolean;
    whatsapp?: boolean;
    telegram?: boolean;
    email?: boolean;
  };
  activitiesOverview?: 'daily' | 'weekly';
}

interface IUserPreferencesArgs extends IUserPreferencesValidationArgs {
  user_id?: Types.ObjectId;
}

type IUserPreferences = Document;

export class UserPreferences {
  public model: Model<IUserPreferences>;
  private _preferencesValidation: Joi.ObjectSchema;
  private _usernameValidation: Joi.ObjectSchema;

  constructor() {
    const schema = new Schema({
      user_id: Types.ObjectId,
      pushNotifications: {
        type: {
          system: Boolean,
          whatsapp: Boolean,
          telegram: Boolean,
          email: Boolean,
        },
        default: {
          system: true,
          whatsapp: false,
          telegram: false,
          email: false,
        },
      },
      activitiesOverview: {
        type: String,
        default: 'weekly',
      },
    });

    this.model = model<IUserPreferences>('UserPreferences', schema);

    // Validation
    this._preferencesValidation = Joi.object({
      pushNotifications: {
        system: Joi.bool(),
        whatsapp: Joi.bool(),
        telegram: Joi.bool(),
        email: Joi.bool(),
      },
      activitiesOverview: Joi.string().valid('daily', 'weekly'),
    });

    this._usernameValidation = Joi.object({
      username: Joi.string().alphanum().min(8).max(16).required(),
    });
  }

  createModel(attrs: IUserPreferencesArgs): IUserPreferences {
    return new this.model(attrs);
  }

  validateModel<T>(attrs: T): Joi.ValidationError | undefined {
    interface UserModel {
      [index: string]: unknown;
      username: string;
    }

    if (((attrs as unknown) as UserModel).username) {
      return this._usernameValidation.validate(attrs).error;
    }

    return this._preferencesValidation.validate(attrs).error;
  }
}
