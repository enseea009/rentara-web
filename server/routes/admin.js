const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get Analytics Data
// Get Analytics Data
router.get('/analytics', async (req, res) => {
    try {
        const stats = {};

        // 1. Total Earnings per Month (Last 6 Months)
        // Includes penalties
        const earningsQuery = `
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month, 
            SUM(total_price + IFNULL(penalty_amount, 0)) as total
            FROM bookings
            WHERE status IN ('Confirmed', 'Completed')
            GROUP BY month
            ORDER BY month DESC
            LIMIT 6
        `;
        const [earnings] = await db.promise().query(earningsQuery);
        stats.monthlyEarnings = earnings;

        // 2. Most Used Car
        const popularQuery = `
            SELECT c.name, c.brand, COUNT(b.id) as booking_count 
            FROM bookings b 
            JOIN cars c ON b.car_id = c.id 
            WHERE b.status != 'Cancelled'
            GROUP BY b.car_id 
            ORDER BY booking_count DESC 
            LIMIT 1
        `;
        const [popular] = await db.promise().query(popularQuery);
        stats.mostUsedCar = popular[0] || null;

        // 3. Maintenance Status
        const maintenanceQuery = `SELECT * FROM cars WHERE status = 'Maintenance'`;
        const [maintenance] = await db.promise().query(maintenanceQuery);
        stats.maintenanceCars = maintenance;

        // 4. High Usage Cars
        const highUsageQuery = `
             SELECT c.name, c.brand, COUNT(b.id) as usage_count 
             FROM bookings b
             JOIN cars c ON b.car_id = c.id
             WHERE b.status != 'Cancelled'
             GROUP BY b.car_id
             HAVING usage_count > 5
             ORDER BY usage_count DESC
        `;
        const [highUsage] = await db.promise().query(highUsageQuery);
        stats.highUsageCars = highUsage;

        // 5. Active Bookings Count (Confirmed AND Not Returned)
        // Exclude Completed/Cancelled
        const activeCountQuery = `
            SELECT COUNT(*) as count FROM bookings 
            WHERE status = 'Confirmed' AND is_returned = FALSE
        `;
        const [activeCount] = await db.promise().query(activeCountQuery);
        stats.activeBookings = activeCount[0].count;

        // 6. Total Cars Count (Sum of Quantity)
        const totalCarsQuery = `SELECT SUM(quantity) as total FROM cars`;
        const [totalCars] = await db.promise().query(totalCarsQuery);
        stats.totalCars = totalCars[0].total || 0;

        // 7. Not Yet Returned (Overdue)
        const overdueQuery = `
            SELECT b.*, c.name as car_name, c.brand, c.id as car_id, u.first_name, u.last_name 
            FROM bookings b
            JOIN cars c ON b.car_id = c.id
            JOIN users u ON b.user_id = u.id
            WHERE b.status = 'Confirmed' 
            AND b.is_returned = FALSE 
            AND b.end_date < CURDATE()
        `;
        const [overdue] = await db.promise().query(overdueQuery);
        stats.overdueBookings = overdue;

        // 8. Currently Rented (Out in facility)
        const rentedQuery = `
            SELECT b.*, c.name as car_name, c.brand 
            FROM bookings b
            JOIN cars c ON b.car_id = c.id
            WHERE b.status = 'Confirmed' AND b.is_returned = FALSE
        `;
        const [rented] = await db.promise().query(rentedQuery);
        stats.rentedCars = rented;

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark as Returned & Calculate Penalty
router.put('/return/:id', async (req, res) => {
    const bookingId = req.params.id;
    try {
        const [bookings] = await db.promise().query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
        if (bookings.length === 0) return res.status(404).json({ message: 'Booking not found' });

        const booking = bookings[0];
        const endDate = new Date(booking.end_date);
        const now = new Date();

        // Calculate overdue days
        // Set both to midnight for fair day comparison
        const overdueTime = now - endDate;
        const overdueDays = Math.ceil(overdueTime / (1000 * 60 * 60 * 24));

        let penalty = 0;
        if (overdueDays > 0) {
            // Fetch car price
            const [cars] = await db.promise().query('SELECT price_per_day FROM cars WHERE id = ?', [booking.car_id]);
            const price = cars[0].price_per_day;

            // Penalty: Double the daily rate for overdue days? Or just standard rate?
            // Let's say standard rate + 500 fee per day
            penalty = overdueDays * (parseFloat(price) + 500);
        }

        await db.promise().query(
            'UPDATE bookings SET is_returned = TRUE, returned_at = NOW(), status = "Completed", penalty_amount = ?, penalty_status = ? WHERE id = ?',
            [penalty, penalty > 0 ? 'Unpaid' : 'None', bookingId]
        );

        res.json({ message: 'Car marked as returned', penalty });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- User Management ---

// Get All Users
router.get('/users', async (req, res) => {
    try {
        // Removed created_at to avoid errors if column is missing in older DB schemas
        const [users] = await db.promise().query('SELECT id, first_name, last_name, email, phone, role FROM users ORDER BY id DESC');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update User
router.put('/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { first_name, last_name, email, phone, role } = req.body;

    try {
        await db.promise().query(
            'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ? WHERE id = ?',
            [first_name, last_name, email, phone, role, userId]
        );
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete User
router.delete('/users/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Optional: Check if user has active bookings before deleting
        // For now, simple delete
        await db.promise().query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
