const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');

// Sign contract for a case
router.post('/case/:id/sign-contract', contractController.signContract);

// Get signed contract for a case
router.get('/case/:id/contract', contractController.getContract);

// Check contract status
router.get('/case/:id/contract-status', contractController.getContractStatus);

module.exports = router;
