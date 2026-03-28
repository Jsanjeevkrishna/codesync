const express = require('express');
const router = express.Router();
const { runCode } = require('../controllers/executeController');

// POST /api/execute
router.post('/', runCode);

module.exports = router;
