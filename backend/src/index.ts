import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './utils/database';

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/vehicles', require('./api/vehicles'));
app.use('/api/bookings', require('./api/bookings'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'FleetLink API is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});