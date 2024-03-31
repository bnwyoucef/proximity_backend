const { Client } = require('@elastic/elasticsearch');
const User = require('../models/User');

const esClient = new Client({ node: process.env.ELASRIC_URL });

// Index MongoDB data to Elasticsearch
exports.indexStoresToElasticsearch = async (store, updateStore) => {
	if (updateStore) {
		// delete the indexed store if it exists
		deleteIndexedDocument(store._id);
	}
	const seller = await User.findById(store.sellerId);
	if (store.address.postalCode === '') store.address.postalCode = 'NAN';
	const storeData = {
		storeId: store._id,
		name: store.name,
		sellerName: seller.username,
		subscriptionId: store.subscriptionId,
		address: store.address,
		status: store.activated ? 'Active' : 'Inactive',
		image: store.image || 'images/stores/shop.jpg',
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
						must: [
							{
								bool: {
									should: [
										{
											wildcard: {
												name: `*${query.name?.toLowerCase() || ''}*`,
											},
										},
										{
											wildcard: {
												sellerName: `*${query.sellerName?.toLowerCase() || ''}*`,
											},
										},
									],
									minimum_should_match: 1, // At least one "should" clause should match
								},
							},
							{
								wildcard: {
									'address.city': `*${query.city?.toLowerCase() || ''}*`,
								},
							},
							{
								wildcard: {
									'address.region': `*${query.region?.toLowerCase() || ''}*`,
								},
							},
							{
								wildcard: {
									'address.streetName': `*${query.streetName?.toLowerCase() || ''}*`,
								},
							},
							{
								wildcard: {
									'address.postalCode': `*${query.postalCode?.toLowerCase() || ''}*`,
								},
							},
						],
					},
				},
			},
		});
		return body.hits.hits.map((hit) => hit._source);
	} catch (error) {
		throw error;
	}
};

async function deleteIndexedDocument(id) {
	await esClient.deleteByQuery({
		index: 'stores',
		body: {
			query: {
				term: {
					storeId: id,
				},
			},
		},
	});
}
