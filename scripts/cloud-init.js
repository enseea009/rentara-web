const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function migrate() {
    console.log('Connecting to Aiven MySQL...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Connected! Reading schema.sql...');
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        let schema = fs.readFileSync(schemaPath, 'utf8');

        // Remove CREATE DATABASE and USE commands as Aiven provides the DB
        schema = schema.replace(/CREATE DATABASE IF NOT EXISTS.*;/gi, '-- skipped CREATE DATABASE');
        schema = schema.replace(/USE .*;/gi, '-- skipped USE');

        console.log('Running migration...');
        await connection.query(schema);

        console.log('✅ Database migration successful!');
        console.log('Tables created and sample data inserted into Aiven.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
