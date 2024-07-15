const path = require('path');
const uuid = require('uuid');
const fileUpload = require('express-fileupload');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const Store = require('../models/Store');
const Sale = require('../models/Sale');

const Payment = require('../models/Payment');
const Bill = require('../models/Bill');
const Order = require('../models/Order');
const StoreRate = require('../models/StoreRate');
const fs = require('fs');
const StoreCategory = require('../models/StoreCategory');
const Category = require('../models/Category');

const { default: mongoose } = require('mongoose');
const { getCategoryByStoreId } = require('./categoryService');
const { indexStoresToElasticsearch } = require('./elasticSearchService');
const { uploadFileToGCS } = require('./storageService');

async function asyncMap(array, asyncFunc) {
	const promises = array.map(asyncFunc);
	return Promise.all(promises);
}

async function asyncMap2(array, asyncFunc, storeId) {
	const promises = array.map((el) => asyncFunc(el, storeId));
	return Promise.all(promises);
}

// Example usage
async function myAsyncStoreCategoryFunc(element) {
	// do some asynchronous operation with item
	if (element.id == null || element.id == 'null') {
		let newStoreCategory = new StoreCategory({
			name: element.name,
		});
		newStoreCategory = await newStoreCategory.save();
		element.Oldid = element.id;
		element.Oldeid = element.eid;
		element.id = newStoreCategory._id;
	}
	return element;
}

async function myAsyncProductCategoryFunc(element) {
	// do some asynchronous operation with item
	element.subCategories = JSON.parse(element.subCategories);

	if (element.id == null || element.id == 'null') {
		let newCategory = new Category({
			name: element.name,
			confirmed: false,
			storeCategoryId: element.storeCategoryDBId,
			subCategories: element.subCategories.map((e) => {
				return { name: e.name, confirmed: false };
			}),
		});
		newCategory = await newCategory.save();
		element.subCategories = element.subCategories.map((e) => {
			let catIndex = newCategory.subCategories.findIndex((el) => el.name == e.name);
			if (catIndex != -1) {
				e.id = newCategory.subCategories[catIndex]._id;
			}
			return e;
		});
		element.id = newCategory._id;
	}
	return element;
}

//createStore
exports.createStore = async (req) => {
	try {
		if (typeof req.body.location === 'string') {
			req.body.location = JSON.parse(req.body.location);
		}
		if (typeof req.body.address === 'string') {
			req.body.address = JSON.parse(req.body.address);
		}
		let storeCategories = [];
		if (typeof req.body.storeCategories === 'string') {
			storeCategories = JSON.parse(req.body.storeCategories);
			storeCategories = await asyncMap(storeCategories, myAsyncStoreCategoryFunc);
		}
		let productCategories = [];
		if (typeof req.body.productCategories === 'string') {
			productCategories = JSON.parse(req.body.productCategories);
			productCategories.map((element) => {
				if (element.storeCategoryDBId == null) {
					let newStoreCategorieId = storeCategories.filter((el) => el.Oldeid == element.storeCategoryId)[0].id;
					element.storeCategoryDBId = newStoreCategorieId;
				}
				return element;
			});
			productCategories = await asyncMap(productCategories, myAsyncProductCategoryFunc);
		}

		let storeRayon = [];
		if (typeof req.body.storeRayons === 'string') {
			storeRayon = JSON.parse(req.body.storeRayons);
			storeRayon = storeRayon.map((e) => {
				return { name: e.name };
			});
		}

		// console.log(req.body.policy);
		let image;

		if (!req.files || Object.keys(req.files).length === 0) {
			throw new Error('No files were uploaded.');
		}

		// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file

		// image = req.files.image;
		// const fileName = `${uuid.v4()}${image.name}`;
		// const uploadPath = path.resolve(__dirname, '..', '..', 'public', 'images', 'stores', fileName);
		// const storagePath = `images/stores/${fileName}`;

		// // Use the mv() method to place the file somewhere on your server

		// image.mv(uploadPath, function (err) {
		// 	if (err) throw err;
		// });

		image = req.files.image;
		const storagePath = await uploadFileToGCS(image);
		const newStore = new Store({
			sellerId: req.user.id,
			name: req.body.name,
			description: req.body.description,
			workingTime: req.body.workingTime,
			image: storagePath,
			revenue: 0,
			address: {
				city: req.body.address.city,
				streetName: req.body.address.streetName,
				postalCode: req.body.address.postalCode,
				fullAdress: req.body.address.fullAdress,
				region: req.body.address.region,
				country: req.body.address.country,
				countryCode: req.body.address.countryCode,
			},
			policy: req.body.policy,
			location: {
				type: 'Point',

				coordinates: [parseFloat(req.body.location.coordinates[1]), parseFloat(req.body.location.coordinates[0])],
			},
			templateId: parseInt(req.body.template),
			storeRayons: storeRayon,
			storeCategorieIds: storeCategories.map((e) => {
				return e.id;
			}),
			productCategorieIds: productCategories.map((e) => {
				let subCategoriesIds = e.subCategories.map((s) => {
					return s.id;
				});
				return { categoryId: e.id, subCategories: subCategoriesIds };
			}),
		});

		const store = await newStore.save();
		indexStoresToElasticsearch(store, false);
		return store;
	} catch (err) {
		throw err;
	}
};
//updateStore
exports.updateStore = async (req) => {
	try {
		const store = await Store.findById(req.params.id);
		if (!Store) {
			throw new Error({ message: 'Store not found' });
		} else {
			if (typeof req.body.location === 'string') {
				req.body.location = JSON.parse(req.body.location);
			}
			if (typeof req.body.address === 'string') {
				req.body.address = JSON.parse(req.body.address);
			}
			if (typeof req.body.storeCategories === 'string') {
				req.body.storeCategories = JSON.parse(req.body.storeCategories);
				req.body.storeCategories = await asyncMap(req.body.storeCategories, myAsyncStoreCategoryFunc);
				req.body.storeCategorieIds = req.body.storeCategories.map((e) => {
					return mongoose.Types.ObjectId(e.id);
				});
				delete req.body.storeCategories;
			}

			if (typeof req.body.productCategories === 'string') {
				req.body.productCategories = JSON.parse(req.body.productCategories);
				req.body.productCategorieIds = await asyncMap(req.body.productCategories, myAsyncProductCategoryFunc);
				req.body.productCategorieIds = req.body.productCategorieIds.map((e) => {
					let subCategoriesIds = e.subCategories.map((s) => {
						return s.id;
					});
					return { categoryId: e.id, subCategories: subCategoriesIds };
				});
				delete req.body.productCategories;
			}

			if (typeof req.body.storeRayons === 'string') {
				req.body.storeRayons = JSON.parse(req.body.storeRayons);
				req.body.storeRayons = req.body.storeRayons.map((e) => {
					if (e.id) {
						return { name: e.name, _id: e.id };
					} else {
						return { name: e.name };
					}
				});
			}
			if (req.body.template != null) {
				req.body.templateId = parseInt(req.body.template);
				delete req.body.template;
			}
			if (store.sellerId != req.user?.id && !req.body.changeSubscription) {
				throw new Error({ message: 'You are not authorized to update this store' });
			} else {
				let image = null;
				let updatedStore = null;

				if (req.files && Object.keys(req.files).length !== 0) {
					// image = req.files.image;
					// const fileName = `${uuid.v4()}${image.name}`;
					// const uploadPath = path.resolve(__dirname, '..', '..', 'public', 'images', 'stores', fileName);
					// const storagePath = `images/stores/${fileName}`;
					// Use the mv() method to place the file somewhere on your server
					// image.mv(uploadPath, function (err) {
					// 	if (err) throw err;
					// });

					// if (store.image != null && store.image != '') {
					// 	fs.unlinkSync(path.resolve(__dirname, '..', '..', 'public') + '/' + store.image);
					// }
					// uploading the image to GCS
					image = req.files.image;
					const storagePath = await uploadFileToGCS(image);
					updatedStore = await Store.findByIdAndUpdate(
						req.params.id,
						{
							$set: {
								...req.body,
								image: storagePath,
							},
						},
						{ new: true }
					);
				} else {
					console.log('im here without image');
					updatedStore = await Store.findByIdAndUpdate(
						req.params.id,
						{
							$set: req.body,
						},
						{ new: true }
					);
				}
				indexStoresToElasticsearch(updatedStore, true);
				return updatedStore;
			}
		}
	} catch (err) {
		console.log(err);
		throw err;
	}
};

//updateStore
exports.updateStoreRating = async (req) => {
	try {
		const store = await Store.findById(req.body.store_id);
		if (!Store) {
			throw new Error({ message: 'Store not found' });
		}

		const updateStoreRate = await StoreRate.findByIdAndUpdate(
			{
				storeId: req.body.storeId,
				userId: req.body.userId,
			},
			{
				rate: req.body.rate,
			},
			{
				new: true,
				upsert: true, // Make this update into an upsert
			}
		);

		let old_sum = Store.ratingSum;
		let old_count = Store.ratingCount;
		const updatedStore = await Store.findByIdAndUpdate(
			req.body.storeId,
			{
				ratingSum: old_sum + req.body.rate,
				ratingCount: old_count + 1,
			},
			{ new: true }
		);
		return updatedStore;
	} catch (err) {
		throw err;
	}
};

//get store
exports.getStore = async (req) => {
	try {
		console.log(req.params.id);
		let store = await Store.findById(req.params.id);
		if (!store) {
			throw new Error({ message: 'Store not found' });
		} else {
			if (!store.policy) {
				const seller = await User.findById(store.sellerId);
				if (seller) {
					store.policy = seller.policy;
				}
			}
			return store;
		}
	} catch (err) {
		throw err;
	}
};
//get seller stores
exports.getSellerStores = async (req) => {
	try {
		const stores = await Store.find({ sellerId: req.user.id });
		if (!stores) {
			throw new Error({ message: 'Stores not found' });
		} else {
			let new_stores = [...stores];

			const seller = await User.findById(req.user.id);

			new_stores.map((element) => {
				if (!element.policy && seller) {
					element.policy = seller.policy;
				}
				return element;
			});
			new_stores = await asyncMap(new_stores, myAsyncSellerStoreFunc);
			console.log(new_stores[new_stores.length - 1]);
			return new_stores;
		}
	} catch (err) {
		console.log(err);
		throw err;
	}
};

exports.getSellerStore = async (req) => {
	try {
		const store = await Store.findById(req.params.id);
		if (!store) {
			throw new Error({ message: 'Store not found' });
		} else {
			let new_stores = [store];

			const seller = await User.findById(req.user.id);

			new_stores.map((element) => {
				if (!element.policy && seller) {
					element.policy = seller.policy;
				}
				return element;
			});
			new_stores = await asyncMap(new_stores, myAsyncSellerStoreFunc);
			console.log(new_stores[new_stores.length - 1]);
			return new_stores[0];
		}
	} catch (err) {
		console.log(err);
		throw err;
	}
};

exports.getSellerCategoriesAndRayons = async (req) => {
	try {
		const store = await Store.findById(req.params.id);
		if (!store) {
			throw new Error({ message: 'Store not found' });
		} else {
			let new_stores = [store];

			const seller = await User.findById(req.user.id);

			new_stores.map((element) => {
				if (!element.policy && seller) {
					element.policy = seller.policy;
				}
				return element;
			});
			new_stores = await asyncMap(new_stores, myAsyncSellerStoreFunc);
			console.log(new_stores[new_stores.length - 1]);

			var cats = await getCategoryByStoreId({
				params: {
					id: new_stores[0]._id,
				},
			});

			console.log({
				rayons: new_stores[0].storeRayons,
				cats: cats.ProductCategories,
			});
			return {
				rayons: new_stores[0].storeRayons,
				cats: cats.ProductCategories,
			};
		}
	} catch (err) {
		console.log(err);
		throw err;
	}
};

async function myAsyncSellerStoreFunc(element) {
	// do some asynchronous operation with item
	if (element.storeRayons) {
		let newstoreRayons = await asyncMap2(element.storeRayons, myAsyncSellerStoreRayonFunc, element._id);
		return { ...element._doc, storeRayons: newstoreRayons };
	}
	return element;
}

async function myAsyncSellerStoreRayonFunc(element, storeId) {
	// do some asynchronous operation with item
	let product_number = await Product.count({ rayonId: element._id, storeId: storeId });
	element = { ...element._doc, product_count: product_number, selected: true };
	return element;
}

//get stores by location
exports.getStoresByLocation = async (req) => {
	try {
		const stores = await Store.find({
			location: {
				$near: {
					$geometry: {
						type: 'Point',
						coordinates: [parseFloat(req.body.location.coordinates[1]), parseFloat(req.body.location.coordinates[0])],
					},
					$maxDistance: parseFloat(req.body.location.maxDistance),
				},
			},
		});
		if (!stores) {
			throw new Error({ message: 'Stores not found' });
		} else {
			return stores;
		}
	} catch (err) {
		throw err;
	}
};

//get stores by city
exports.getStoresByCity = async (req) => {
	try {
		const stores = await Store.aggregate([
			{
				$unwind: '$address',
			},
			{
				$match: {
					'address.city': req.params.city,
				},
			},
		]);
		return stores;
	} catch (err) {
		throw err;
	}
};

//delete store
exports.deleteStore = async (req) => {
	try {
		const store = await Store.findById(req.params.storeId);

		if (!store) {
			throw new Error('Store not found');
		}
		await Product.deleteMany({ storeId: req.params.storeId });

		await Store.findByIdAndDelete(req.params.storeId);

		return { message: 'Product deleted successfully' };
	} catch (err) {
		throw err;
	}
};
// get stores Income
exports.getSellerStoresIncome = async (req) => {
	try {
		const stores = await Store.find({ sellerId: req.user.id });
		if (!stores || stores.length === 0) {
			throw new Error('Stores not found');
		} else {
			const seller = await User.findById(req.user.id);
			let totalRevenue = 0;
			const storeData = stores.map((store) => {
				const storeInfo = {
					storeName: store.name,
					revenue: store.revenue,
				};
				totalRevenue += store.revenue;

				if (!store.policy && seller) {
					storeInfo.policy = seller.policy;
				}
				return storeInfo;
			});
			const result = {
				stores: storeData,
				totalRevenue: totalRevenue,
			};
			return result;
		}
	} catch (err) {
		throw err;
	}
};

// get all the stores of a Seller with subscriptionId
exports.getAllSellerStores = async (req) => {
	try {
		const stores = await Store.find({ sellerId: req.params.id });
		let sellerStores = [];
		stores.map((store) => {
			sellerStores.push({
				storeId: store.id,
				name: store.name,
				subscriptionId: store.subscriptionId,
				status: store.isActive ? 'active' : 'inactive',
				address: store.address,
				image: store?.image,
			});
		});
		return sellerStores;
	} catch (error) {
		throw error;
	}
};
// ibrahim : get all the stores

exports.getAllStores = async function getAllStores() {
	try {
		const stores = await Store.find();
		return stores;
	} catch (error) {
		throw new Error('Could not fetch stores');
	}
};
// ibrahim : get the stores by city ..
exports.getAllStoresInCity = async function getAllStoresInCity(city) {
	try {
		const stores = await Store.find({ 'address.city': city }).exec();
		return stores;
	} catch (error) {
		throw error;
	}
};
// ibrahim get the stores by category
exports.getStoresByCategory = async function getStoresByCategory(categoryId) {
	try {
		const stores = await Store.find({ storeCategorieIds: categoryId }).exec();
		return stores;
	} catch (error) {
		throw error;
	}
};
// ibrahim : get all the store of one seller
exports.getStoresOfSeller = async function getStoresOfSeller(sellerId) {
	try {
		const stores = await Store.find({ sellerId: sellerId });
		return stores;
	} catch (error) {
		throw error;
	}
};
// ibrahim : get the most active stores
//   exports.getMostActiveStores = async function getMostActiveStores() {

// 	try {
// 	  const storeSales = await Sale.aggregate([
// 		{
// 		  $group: {
// 			_id: '$storeId',
// 			totalSales: { $sum: 1 }
// 		  }
// 		},
// 		{
// 		  $sort: { totalSales: -1 }
// 		}
// 	  ]);

// 	  const storeIds = storeSales.map(sale => sale._id);
// 	  const mostActiveStores = await Store.find({ _id: { $in: storeIds } });

// 	  return mostActiveStores;
// 	} catch (error) {
// 	  console.error('Error fetching most active stores:', error);
// 	  throw error;
// 	}
//   }
exports.getMostActiveStores = async function getMostActiveStores() {
	try {
		const storeSales = await Sale.aggregate([
			{
				$group: {
					_id: '$storeId',
					totalSales: { $sum: 1 },
				},
			},
			{
				$sort: { totalSales: -1 },
			},
		]);

		const storeIds = storeSales.map((sale) => sale._id);

		// Find all stores, regardless of whether they have sales or not
		const stores = await Store.find();

		// Map through all stores and add the totalSales field based on the aggregated data
		const mostActiveStores = stores.map((store) => {
			const totalSales = storeSales.find((sale) => sale._id.equals(store._id))?.totalSales || 0;
			return { ...store.toObject(), totalSales };
		});

		return mostActiveStores;
	} catch (error) {
		console.error('Error fetching most active stores:', error);
		throw error;
	}
};
