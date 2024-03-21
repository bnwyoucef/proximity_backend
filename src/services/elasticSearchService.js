const { Client } = require('@elastic/elasticsearch');
const User = require('../models/User');

const esClient = new Client({ node: process.env.ELASRIC_URL });

// Index MongoDB data to Elasticsearch
exports.indexStoresToElasticsearch = async (store) => {
	const seller = await User.findById(store.sellerId);
	const storeData = {
		storeId: store._id,
		name: store.name,
		sellerName: seller.username,
		address: store.address,
		status: store.activated,
		image: store.image,
	};
	await esClient.index({
		index: 'stores',
		body: storeData,
	});
};

// search using Elasticsearch
exports.searchStores = async (query) => {
	try {
		const body = await esClient.search({
			index: 'stores',
			body: {
				query: {
					bool: {
						should: [
							{
								wildcard: {
									name: `*${query}*`,
								},
							},
							{
								wildcard: {
									description: `*${query}*`,
								},
							},
							{
								wildcard: {
									'address.city': `*${query}*`,
								},
							},
							{
								wildcard: {
									'address.region': `*${query}*`,
								},
							},
							{
								wildcard: {
									'address.streetName': `*${query}*`,
								},
							},
							{
								wildcard: {
									'address.postalCode': `*${query}*`,
								},
							},
						],
					},
				},
				aggs: {
					unique_names: {
						terms: {
							field: 'name.keyword',
							size: 100, // maximum number of unique values to return
						},
						aggs: {
							top_hits: {
								top_hits: {
									size: 1, //top document for each unique name
								},
							},
						},
					},
				},
			},
		});

		const uniqueDocuments = body.aggregations.unique_names.buckets.map((bucket) => bucket.top_hits.hits.hits[0]._source);

		return uniqueDocuments;
	} catch (error) {
		throw error;
	}
};
