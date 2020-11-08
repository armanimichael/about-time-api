import mongoose from 'mongoose';
import { User } from './../models/user';
import { UserPreferences } from './../models/user-preferences';

interface ICollection {
  User: User;
  UserPreferences: UserPreferences;
}

export class Database {
  private static instance: Database;

  private _db: mongoose.Connection;
  private _collections: ICollection;

  private constructor() {
    mongoose.connect(process.env.DB_HOST || '', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    this._db = mongoose.connection;
    this._db.on('open', this.connected);
    this._db.on('error', this.error);

    this._collections = {
      User: new User(),
      UserPreferences: new UserPreferences(),
    };
  }

  public static get collections(): ICollection {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance._collections;
  }

  private connected() {
    console.log('DB Connected');
  }

  private error(error: unknown) {
    console.error(`DB Error: ${error}`);
  }
}
