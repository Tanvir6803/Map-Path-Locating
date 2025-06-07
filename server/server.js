const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'drone_db',
  password: '1234',
  port: 5432,
});

// Root
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Fetch visible data
app.get('/map-data', async (req, res) => {
  try {
    const points = await pool.query('SELECT * FROM points WHERE status = $1', ['visible']);
    const lines = await pool.query('SELECT * FROM lines WHERE status = $1', ['visible']);
    res.json({ points: points.rows, lines: lines.rows });
  } catch (err) {
    console.error('❌ Error in /map-data:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Save point
app.post('/add-point', async (req, res) => {
  const { pointId, lat, lng } = req.body;
  try {
    await pool.query(
      `INSERT INTO points (point_id, lat, lng) 
       VALUES ($1, $2, $3)
       ON CONFLICT (point_id) DO UPDATE SET lat = $2, lng = $3, status = 'visible'`,
      [pointId, lat, lng]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error in /add-point:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Save line
app.post('/add-line', async (req, res) => {
  const { lineId, start, end } = req.body;
  try {
    await pool.query(
      `INSERT INTO lines (line_id, start_point_id, end_point_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (line_id) DO UPDATE SET start_point_id = $2, end_point_id = $3, status = 'visible'`,
      [lineId, start, end]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error in /add-line:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Soft remove point
app.post('/remove-point', async (req, res) => {
  const { pointId } = req.body;
  try {
    await pool.query('UPDATE points SET status = $1 WHERE point_id = $2', ['removed', pointId]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error in /remove-point:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Soft remove line
app.post('/remove-line', async (req, res) => {
  const { lineId } = req.body;
  try {
    await pool.query('UPDATE lines SET status = $1 WHERE line_id = $2', ['removed', lineId]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error in /remove-line:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  pool.query('SELECT NOW()').then(() => console.log('✅ PostgreSQL connected'));
});