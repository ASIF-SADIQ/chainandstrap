const express = require('express');
const router = express.Router();
const { generatePinterestCatalog, generatePinterestFeedXml } = require('../controllers/catalogController');

router.get('/catalog.csv', generatePinterestCatalog);
router.get('/feed.xml', generatePinterestFeedXml);

module.exports = router;
