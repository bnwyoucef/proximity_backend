const ElasticSearchService = require('../services/elasticSearchService');

// search for stores
exports.searchStores = async (req, res) => {
	try {
		const stores = await ElasticSearchService.searchStores(req.body.query);
		res.send(stores);
	} catch (error) {
		res.status(500).send(error.message);
	}
};
