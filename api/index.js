// Rentara Server (Vercel API Entry Point)
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const db = require('../server/config/db'); // Adjusted path

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import Routes
const authRoutes = require('../server/routes/auth'); // Adjusted paths
const carRoutes = require('../server/routes/cars');
const bookingRoutes = require('../server/routes/bookings');
const adminRoutes = require('../server/routes/admin');

const path = require('path');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT 1');
        const [carCount] = await db.promise().query('SELECT COUNT(*) as count FROM cars');
        res.json({
            status: 'ok',
            database: 'connected',
            cars_in_database: carCount[0].count,
            config: {
                host: process.env.DB_HOST,
                name: process.env.DB_NAME
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message,
            tip: "If it says 'table cars doesn't exist', run node scripts/cloud-init.js in your local terminal."
        });
    }
});

// For Vercel, we don't need app.listen() but we keep it for local testing
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
