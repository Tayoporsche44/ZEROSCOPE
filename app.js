'use strict';

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const dashboardController = require('./controllers/dashboardController');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zeroscope';
mongoose
  .connect(MONGO_URI)
  .then(() => console.log(`[MongoDB] Connected → ${MONGO_URI}`))
  .catch((err) => { console.error('[MongoDB] Error:', err.message); process.exit(1); });

// ─── Routes ──────────────────────────────────────────────────
app.get('/', dashboardController.getDashboard);
app.get('/bookmarks', dashboardController.getBookmarks);
app.post('/bookmarks', dashboardController.saveBookmark);
app.post('/bookmarks/:id/delete', dashboardController.deleteBookmark);
app.post('/bookmarks/:id/status', dashboardController.updateBookmarkStatus);

// 404
app.use((req, res) => {
  res.status(404).render('error', {
    statusCode: 404,
    message: 'Page not found.',
    title: '404 — ZEROSCOPE',
  });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).render('error', {
    statusCode: err.status || 500,
    message: err.message || 'Unexpected error.',
    title: 'Error — ZEROSCOPE',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[ZEROSCOPE] http://localhost:${PORT}`));

module.exports = app;