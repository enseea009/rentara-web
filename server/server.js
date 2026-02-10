// Rentara Server 1.0.1 - Deployed at 2026-02-11
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const db = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection Test
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
    } else {
        console.log('Connected to MySQL database!');
        connection.release();
    }
});

// Import Routes
const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin'); // New

const path = require('path');

// ... (middleware setup)

// Serve Static Files
// Use process.cwd() to ensure correct pathing on Vercel
app.use(express.static(process.cwd()));

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

// Catch-all route to serve index.html or 404
// For a multi-page static site without client-side routing (React/Vue), 
// we rely on direct file access (e.g. /pages/login.html).
// But for the root path '/', we send index.html explicitly if static didn't catch it.
// Health check is above. Vercel will serve index.html natively from the root folder.

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
