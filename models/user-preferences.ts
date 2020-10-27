import { Schema, model, Document, Model, Types } from 'mongoose';
import Joi from 'joi';

interface IUserPreferencesValidationArgs {
  username?: string;
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

interface IUserPreferences extends Document {}

export class UserPreferences {
  public model: Model<IUserPreferences>;
  private _preferencesValidation: Joi.ObjectSchema;

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
      username: Joi.string().alphanum().min(8).max(6),
      pushNotifications: {
        system: Joi.bool(),
        whatsapp: Joi.bool(),
        telegram: Joi.bool(),
        email: Joi.bool(),
      },
      activitiesOverview: Joi.string().valid('daily', 'weekly'),
    });
  }

  createModel(attrs: IUserPreferencesArgs) {
    return new this.model(attrs);
  }

  validateModel(
    attrs: IUserPreferencesValidationArgs,
  ): Joi.ValidationError | undefined {
    return this._preferencesValidation.validate(attrs).error;
  }
}
