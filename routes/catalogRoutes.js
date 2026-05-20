const express = require('express');
const router = express.Router();
const { generatePinterestCatalog } = require('../controllers/catalogController');

router.get('/catalog.csv', generatePinterestCatalog);

module.exports = router;
