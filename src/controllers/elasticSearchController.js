const ElasticSearchService = require('../services/elasticSearchService');

// search for stores
exports.searchStores = async (req, res) => {
	try {
		const stores = await ElasticSearchService.searchStores(req.body);
		res.send(stores);
	} catch (error) {
		res.status(500).send(error.message);
	}
};

// search for subscriptions
exports.searchSubscriptions = async (req, res) => {
	try {
		const subscriptions = await ElasticSearchService.searchSubscriptions(req.body);
		res.send(subscriptions);
	} catch (error) {
		res.status(500).send(error.message);
	}
};
