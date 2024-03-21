const Store = require('../models/Store');
const { Client } = require('@elastic/elasticsearch');

// Connect to Elasticsearch using Elasticsearch client
const esClient = new Client({ node: 'http://localhost:9200' }); // add the url to env var

// Index MongoDB data to Elasticsearch
indexStoresToElasticsearch = async () => {
	const stores = await Store.find();
	for (const store of stores) {
		const { _id, ...storeData } = store.toObject();
		await esClient.index({
			index: 'stores',
			body: storeData,
		});
	}
};

// Perform searches using Elasticsearch
exports.searchStores = async (query) => {
	try {
		await indexStoresToElasticsearch();
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

// Example usage
// async function main() {
// 	// Index stores to Elasticsearch
// 	await indexStoresToElasticsearch();

// 	// Search for products
// 	const results = await searchStores('laptop');
// 	console.log('Search results:', results);
// }

// main().catch(console.error);
