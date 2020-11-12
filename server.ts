import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import userPreferencesRoutes from './routes/user-preferences';

import { jwtAuthentication } from './middlewares/jwt-auth';

// Env Vars
dotenv.config();

// App
const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(authRoutes);
app.use('/user/preferences', jwtAuthentication, userPreferencesRoutes);

// Routes
app.get('/', (req, res) => res.send('Absolutely nothing here'));

// * Server Listening
app.listen(PORT, () => {
  console.log(`⚡️[About Time - Rest API]: Server running on PORT ${PORT}`);
});
