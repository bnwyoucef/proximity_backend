const { Client } = require('@elastic/elasticsearch');
const User = require('../models/User');
const Store = require('../models/Store');
const Plan = require('../models/Plan');

const esClient = new Client({ node: process.env.ELASTIC_URL });

// store index
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
		//TODO:Link the store with it's subscription id
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

// subscription index
exports.indexSubscriptionToElasticsearch = async (subscription, storeId) => {
	// if (updateSubscription) {
	// 	deleteIndexedSubscription(subscription._id);
	// }
	const manager = await User.findById(subscription.paymentManagerId);
	if (manager) {
		const store = await Store.findById(subscription.storeId || storeId);
		const seller = await User.findById(store.sellerId);
		const plan = await Plan.findById(subscription.planId);
		if (store.address.postalCode === '') store.address.postalCode = 'NAN';
		const subscriptionData = {
			subscriptionId: subscription._id,
			type: plan.type,
			paymentDate: subscription.startDate,
			paymentManager: manager.username,
			sellerName: seller.username,
			address: store.address,
			storeName: store.name,
			status: subscription.status,
			paymentAmount: subscription.paymentAmount,
		};
		await esClient.index({
			index: 'subscriptions',
			body: subscriptionData,
		});
	}
};

// stores search
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

// subscription search
exports.searchSubscriptions = async (query) => {
	try {
		const queryBody = {
			index: 'subscriptions',
			body: {
				query: {
					bool: {
						filter: [],
						must: [
							{
								bool: {
									should: [
										{
											wildcard: {
												storeName: `*${query.storeName?.toLowerCase() || ''}*`,
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
		};
		// from date
		if (query.paymentDateAfter !== null) {
			queryBody.body.query.bool.filter.push({ range: { paymentDate: { gte: query.paymentDateAfter } } });
		}
		// to date
		if (query.paymentDateBefore !== null) {
			queryBody.body.query.bool.filter.push({ range: { paymentDate: { lte: query.paymentDateBefore } } });
		}

		const response = await esClient.search(queryBody);
		return response.hits.hits.map((hit) => hit._source);
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
exports.deleteIndexedSubscription = async (id) => {
	await esClient.deleteByQuery({
		index: 'subscriptions',
		body: {
			query: {
				term: {
					subscriptionId: id,
				},
			},
		},
	});
};
