require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apsRoutes = require('./routes/aps');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/aps', apsRoutes);

app.get('/api/config', (req, res) => {
  res.json({ clientName: process.env.CLIENT_NAME || 'APS' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    message: 'APS Grid Operations API',
    client: process.env.CLIENT_NAME || 'APS',
    endpoints: { config: '/api/config', status: '/api/aps/status', regions: '/api/aps/regions', alerts: '/api/aps/alerts', stats: '/api/aps/stats' }
  });
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ error: err.message }); });

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`⚡ APS API running on port ${PORT}`);
    console.log(`   Client: ${process.env.CLIENT_NAME || 'APS'}`);
  });
}

module.exports = app;
// Made with Bob
