// server/db.js
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'sorochat',
  password: 'sorochat123',
  database: 'AIData',
  port: 5432
});

const saveClient = async (name, city, phone, childAge, desiredGroup) => {
  const clientData = [name, city, phone, childAge, desiredGroup];

  try {
    await pool.query('INSERT INTO clients (name, city, phone, child_age, desired_group) VALUES ($1, $2, $3, $4, $5)', clientData);
    console.log('Client saved successfully');
  } catch (err) {
    console.error('Error saving client: ', err);
  }
}

module.exports = { saveClient };
