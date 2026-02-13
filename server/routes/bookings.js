const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create Booking
router.post('/', async (req, res) => {
    const { user_id, car_id, start_date, end_date, total_price, payment_method } = req.body;

    try {
        // Insert booking
        const [result] = await db.promise().query(
            'INSERT INTO bookings (user_id, car_id, start_date, end_date, total_price, status) VALUES (?, ?, ?, ?, ?, "Confirmed")',
            [user_id, car_id, start_date, end_date, total_price]
        );

        const bookingId = result.insertId;

        // Insert payment record
        await db.promise().query(
            'INSERT INTO payments (booking_id, amount, payment_method, payment_status) VALUES (?, ?, ?, "Paid")',
            [bookingId, total_price, payment_method]
        );

        res.status(201).json({ message: 'Booking confirmed', bookingId });
    } catch (err) {
        console.error("Booking creation error:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get User Bookings
router.get('/user/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const query = `
            SELECT b.*, c.name as car_name, c.brand, c.type 
            FROM bookings b 
            JOIN cars c ON b.car_id = c.id 
            WHERE b.user_id = ? 
            ORDER BY b.created_at DESC
        `;
        const [bookings] = await db.promise().query(query, [userId]);
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Bookings (Admin)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT b.*, c.name as car_name, c.brand, u.first_name, u.last_name 
            FROM bookings b 
            JOIN cars c ON b.car_id = c.id 
            JOIN users u ON b.user_id = u.id 
            ORDER BY b.created_at DESC
        `;
        const [bookings] = await db.promise().query(query);
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel Booking
router.put('/cancel/:id', async (req, res) => {
    const bookingId = req.params.id;

    try {
        // Check booking start date
        const [bookings] = await db.promise().query('SELECT * FROM bookings WHERE id = ?', [bookingId]);

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const booking = bookings[0];
        const startDate = new Date(booking.start_date);
        const currentDate = new Date();

        // Allow cancellation if current date is before start date
        // Reset time to midnight for comparison to be safe/fair
        startDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        if (currentDate >= startDate) {
            return res.status(400).json({ message: 'Cannot cancel booking. Start date has passed or is today.' });
        }

        await db.promise().query('UPDATE bookings SET status = "Cancelled" WHERE id = ?', [bookingId]);
        res.json({ message: 'Booking cancelled successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
