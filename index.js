require('dotenv').config();
const express = require('express');
const mongodb = require('./config/db');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const pointsRoutes = require('./routes/pointsRoutes');
const withdrawalRoutes = require('./routes/withdrawRoutes');
const onboardingRoutes = require('./routes/onboarding');
const adminRoutes = require('./routes/adminRoutes');
const promoCodeRoutes = require('./routes/promoCodeRoutes');

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/onboarding', onboardingRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/promocodes', promoCodeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
