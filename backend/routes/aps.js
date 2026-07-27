const express = require('express');
const router = express.Router();
const apsService = require('../services/apsService');

router.get('/status',  async (req, res) => { try { res.json(await apsService.getStatus());  } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/regions', async (req, res) => { try { res.json(await apsService.getRegions()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/alerts',  async (req, res) => { try { res.json(await apsService.getAlerts());  } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/stats',   async (req, res) => { try { res.json(await apsService.getStats());   } catch (e) { res.status(500).json({ error: e.message }); } });

module.exports = router;
// Made with Bob
