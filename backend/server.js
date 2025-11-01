require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const weatherRoutes = require('./routes/weatherRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// Routes
app.use('/api', weatherRoutes);

// Test route
app.get('/api/test', (Req, res) => {
    res.json({ message: 'API is working!' });
});

// Start server
app.listen(PORT, () => {
    console.log('Server running on http://localhost:${PORT}');
});