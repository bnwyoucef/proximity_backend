const router = require('express').Router();
var ElasticSearchController = require('../controllers/elasticSearchController');

router.post('/store', ElasticSearchController.searchStores);
router.post('/subscriptions', ElasticSearchController.searchSubscriptions);
module.exports = router;