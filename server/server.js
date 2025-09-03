require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const swaggerDocument = YAML.load('c:/Users/Mayank/Desktop/projects/digital-wallet-system/server/docs/openapi.yaml');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Digital Wallet API is running' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {

    // Load routes **AFTER** DB is ready
    const authRoutes = require('c:/Users/Mayank/Desktop/projects/digital-wallet-system/server/routes/auth.js');
    const walletRoutes = require('c:/Users/Mayank/Desktop/projects/digital-wallet-system/server/routes/wallet.js');
    const adminRoutes = require('c:/Users/Mayank/Desktop/projects/digital-wallet-system/server/routes/admin.js');
    const fraudJobs = require('c:/Users/Mayank/Desktop/projects/digital-wallet-system/server/jobs/fraudScanner.js');

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
