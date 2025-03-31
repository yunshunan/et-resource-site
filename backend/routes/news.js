const express = require('express');
const router = express.Router();
const { getNewsList, getNewsById } = require('../controllers/newsController');

router.get('/', getNewsList);
router.get('/:id', getNewsById);

module.exports = router; 