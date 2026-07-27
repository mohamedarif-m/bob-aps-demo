require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apsRoutes = require('./routes/aps');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// APS routes
app.use('/api/aps', apsRoutes);

// Client config — lets the frontend resolve all branding at runtime.
// Set CLIENT_NAME, CLIENT_TAGLINE, CLIENT_COLOR_PRIMARY, CLIENT_COLOR_SECONDARY
// in .env to rebrand without touching any code.
app.get('/api/config', (req, res) => {
  res.json({
    clientName:     process.env.CLIENT_NAME            || 'APS',
    clientTagline:  process.env.CLIENT_TAGLINE         || 'Arizona Public Service — Real-time Dashboard',
    colorPrimary:   process.env.CLIENT_COLOR_PRIMARY   || '#003087',
    colorSecondary: process.env.CLIENT_COLOR_SECONDARY || '#E87722',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'APS Grid Operations API',
    client: process.env.CLIENT_NAME || 'APS',
    endpoints: {
      config: '/api/config',
      status: '/api/aps/status',
      regions: '/api/aps/regions',
      alerts: '/api/aps/alerts',
      stats: '/api/aps/stats'
    }
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`⚡ APS API running on port ${PORT}`);
    console.log(`   Client: ${process.env.CLIENT_NAME || 'APS'}`);
  });
}

module.exports = app;

// Made with Bob
