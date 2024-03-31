const router = require('express').Router();
var ElasticSearchController = require('../controllers/elasticSearchController');

router.post('/store', ElasticSearchController.searchStores);
module.exports = router;
