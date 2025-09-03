require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

 const path = require('path');

const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// DB health route
app.get('/db/health', (req, res) => {
  const stateMap = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    state: stateMap[mongoose.connection.readyState],
    host: mongoose.connection.host,
    name: mongoose.connection.name
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Digital Wallet API is running' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {

    // Load routes **AFTER** DB is ready
    const authRoutes = require('./routes/auth');
    const walletRoutes = require('./routes/wallet');
    const adminRoutes = require('./routes/admin');
    const fraudJobs = require('./jobs/fraudScanner');

    app.use('/api/auth', authRoutes);
    app.use('/api/wallet', walletRoutes);
    app.use('/api/admin', adminRoutes);

    // Swagger Docs
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Start server only after DB ready
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
    console.log('✅ Connected to MongoDB')
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);

  });
