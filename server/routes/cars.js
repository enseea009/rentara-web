const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all cars with stock availability
router.get('/', async (req, res) => {
    const { type } = req.query;
    let query = `
        SELECT c.*, 
        (c.quantity - (
            SELECT COUNT(*) FROM bookings b 
            WHERE b.car_id = c.id 
            AND b.status IN ('Confirmed', 'Pending')
            AND b.is_returned = FALSE
            AND b.start_date <= CURDATE() AND b.end_date >= CURDATE()
        )) as available_stock 
        FROM cars c 
        WHERE 1=1
    `;

    // Note: Availability logic above is "currently rented".
    // For future searches, we need date ranges. But for dashboard/list, this is good.

    const params = [];

    if (type) {
        query += ' AND type = ?';
        params.push(type);
    }

    try {
        const [cars] = await db.promise().query(query, params);
        res.json(cars);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Add New Car
router.post('/', async (req, res) => {
    const { name, brand, type, price_per_day, image_url, transmission, passengers, quantity } = req.body;
    try {
        await db.promise().query(
            'INSERT INTO cars (name, brand, type, price_per_day, image_url, transmission, passengers, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, brand, type, price_per_day, image_url, transmission, passengers, quantity || 1]
        );
        res.status(201).json({ message: 'Car added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Update Car
router.put('/:id', async (req, res) => {
    const { name, brand, type, price_per_day, transmission, passengers, quantity, status } = req.body;
    try {
        // Dynamic update
        await db.promise().query(
            'UPDATE cars SET name=?, brand=?, type=?, price_per_day=?, transmission=?, passengers=?, quantity=?, status=? WHERE id=?',
            [name, brand, type, price_per_day, transmission, passengers, quantity, status, req.params.id]
        );
        res.json({ message: 'Car updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Delete Car
router.delete('/:id', async (req, res) => {
    try {
        await db.promise().query('DELETE FROM cars WHERE id = ?', [req.params.id]);
        res.json({ message: 'Car deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Could not delete car. It may have existing bookings.' });
    }
});

module.exports = router;
