const router = require('express').Router();
var ElasticSearchController = require('../controllers/elasticSearchController');

router.post('/', ElasticSearchController.searchStores);
module.exports = router;
