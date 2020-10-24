import express from 'express';
import authRoutes from './routes/auth';
import dotenv from 'dotenv';

// Env Vars
dotenv.config();

// App
const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(express.json());
app.use(authRoutes);

// Routes
app.get('/', (req, res) => res.send('Absolutely nothing here'));

// * Server Listening
app.listen(PORT, () => {
  console.log(`⚡️[About Time - Rest API]: Server running on port ${PORT}`);
});
