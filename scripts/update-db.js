const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const updates = [
    "ALTER TABLE cars ADD COLUMN quantity INT DEFAULT 1",
    "ALTER TABLE bookings ADD COLUMN is_returned BOOLEAN DEFAULT FALSE",
    "ALTER TABLE bookings ADD COLUMN returned_at DATETIME NULL",
    "ALTER TABLE bookings ADD COLUMN penalty_amount DECIMAL(10, 2) DEFAULT 0.00",
    "ALTER TABLE bookings ADD COLUMN penalty_status ENUM('None', 'Unpaid', 'Paid') DEFAULT 'None'"
];

function runUpdates() {
    console.log('Applying database updates...');
    let pending = updates.length;

    updates.forEach(query => {
        connection.query(query, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('Column already exists, skipping.');
                } else {
                    console.error('Error applying update:', err.message);
                }
            } else {
                console.log('Update applied:', query);
            }
            pending--;
            if (pending === 0) {
                console.log('All updates finished.');
                connection.end();
            }
        });
    });
}

runUpdates();
