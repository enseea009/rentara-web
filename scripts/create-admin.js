const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function createAdmin() {
    const password = 'admin123'; // Default admin password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const query = `
        INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
        VALUES ('System', 'Admin', 'admin@rentara.com', '0000000000', ?, 'admin')
    `;

    connection.query(query, [hash], (err, result) => {
        if (err) {
            console.error('Error creating admin:', err.message);
        } else {
            console.log('Admin user created successfully!');
            console.log('Email: admin@rentara.com');
            console.log('Password: admin123');
        }
        connection.end();
    });
}

createAdmin();
