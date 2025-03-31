const express = require('express');
const router = express.Router();
const { getResources, getResourceById } = require('../controllers/resourceController');

router.get('/', getResources);
router.get('/:id', getResourceById);

module.exports = router; 