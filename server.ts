import express from 'express';
import authRoutes from './routes/auth';

const app = express();
const PORT = 8000;

// Middlewares
app.use(express.json());
app.use(authRoutes);

// Routes
app.get('/', (req, res) => res.send('Absolutely nothing here'));

// * Server Listening
app.listen(PORT, () => {
  console.log(`⚡️[About Time - Rest API]: Server running on port ${PORT}`);
});
