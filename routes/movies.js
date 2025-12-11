// server/routes/movies.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /movies
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM movies ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// POST /movies
router.post('/', async (req, res) => {
  const { title, director, genre, release_year, rating } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  try {
    const [result] = await pool.query(
      `INSERT INTO movies (title, director, genre, release_year, rating) VALUES (?, ?, ?, ?, ?)`,
      [title, director || null, genre || null, release_year || null, rating || null]
    );
    const [rows] = await pool.query('SELECT * FROM movies WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// PUT /movies/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, director, genre, release_year, rating } = req.body;
  try {
    await pool.query(
      `UPDATE movies SET title = ?, director = ?, genre = ?, release_year = ?, rating = ? WHERE id = ?`,
      [title, director, genre, release_year, rating, id]
    );
    const [rows] = await pool.query('SELECT * FROM movies WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// DELETE /movies/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM movies WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
