const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'hydroflow',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS telemetry (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        device_id VARCHAR(50),
        sensor_type VARCHAR(50),
        value REAL
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        chain_name VARCHAR(100),
        action VARCHAR(255),
        trigger VARCHAR(255)
      );
    `);
    console.log("[DB] Tables initialized.");
  } catch (err) {
    console.error("[DB] Error initializing tables:", err);
  }
};

// Initialize on startup
initDB();

module.exports = {
  initDB, // <--- Add this line!
  query: (text, params) => pool.query(text, params),
  pool,
  logActivity: (chain, action, trigger) => {
    return pool.query(
      'INSERT INTO activities (chain_name, action, trigger) VALUES ($1, $2, $3)',
      [chain, action, trigger]
    );
  }
};