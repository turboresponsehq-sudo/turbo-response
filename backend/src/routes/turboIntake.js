const express = require('express');
const router = express.Router();
const { submit } = require('../controllers/turboIntakeController');

// POST /api/turbo-intake - Submit new business intake form
router.post('/', submit);

module.exports = router;
