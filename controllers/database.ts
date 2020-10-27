import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './../models/user';
import { UserPreferences } from './../models/user-preferences';

// * ENV VARIABLES
dotenv.config();

interface IDocuments {
  User: User;
  UserPreferences: UserPreferences;
}

export class Database {
  private static instance: Database;

  private _db: mongoose.Connection;
  private _documents: IDocuments;

  private constructor() {
    mongoose.connect(process.env.DB_HOST || '', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this._db = mongoose.connection;
    this._db.on('open', this.connected);
    this._db.on('error', this.error);

    this._documents = {
      User: new User(),
      UserPreferences: new UserPreferences(),
    };
  }

  public static get documents(): IDocuments {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance._documents;
  }

  private connected() {
    console.log('DB Connected');
  }

  private error(error: any) {
    console.error(`DB Error: ${error}`);
  }
}
