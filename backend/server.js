const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const propertyRoutes = require('./src/routes/property');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:8080'
}));
app.use(express.json());

// Routes
app.use('/property', propertyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});