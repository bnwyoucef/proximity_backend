const path = require('path');
const uuid = require('uuid');
const fileUpload = require('express-fileupload');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const Store = require('../models/Store');
const Payment = require('../models/Payment');
const Bill = require('../models/Bill');
const Order = require('../models/Order');
const StoreRate = require('../models/StoreRate');
const fs = require('fs');

//createStore
exports.createStore = async (req) => {
	try {
		if (typeof req.body.location === 'string') {
			req.body.location = JSON.parse(req.body.location);
		}
		if (typeof req.body.address === 'string') {
			req.body.address = JSON.parse(req.body.address);
		}
		console.log(req.body.policy);
		let image;

		if (!req.files || Object.keys(req.files).length === 0) {
			throw new Error('No files were uploaded.');
		}

		// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file

		image = req.files.image;
		const fileName = `${uuid.v4()}${image.name}`;
		const uploadPath = path.resolve(__dirname, '..', '..', 'public', 'images', 'stores', fileName);
		const storagePath = `images/stores/${fileName}`;
		console.log(storagePath, 'storagePath');

		// Use the mv() method to place the file somewhere on your server

		image.mv(uploadPath, function (err) {
			if (err) throw err;
		});

		const newStore = new Store({
			sellerId: req.user.id,
			name: req.body.name,
			description: req.body.description,
			workingTime:  req.body.workingTime ,
			image: storagePath,
			revenue :0 ,
			address: {
				city: req.body.address.city,
				streetName: req.body.address.streetName,
				postalCode: req.body.address.postalCode,
				fullAdress: req.body.address.fullAdress,
				region: req.body.address.region,
				country: req.body.address.country,
				countryCode: req.body.address.countryCode,
			},
			policy : req.body.policy , 
			location: {
				type: 'Point',

				coordinates: [parseFloat(req.body.location.coordinates[1]), parseFloat(req.body.location.coordinates[0])],
			},
		});

		const store = await newStore.save();
		return store;
	} catch (err) {
		console.log(err);
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
			if (store.sellerId != req.user.id) {
				throw new Error({ message: 'You are not authorized to update this store' });
			} else {
				let image = null ;
				let updatedStore = null ;
				
				if (req.files && Object.keys(req.files).length !== 0) {	
					image = req.files.image;
					const fileName = `${uuid.v4()}${image.name}`;
					const uploadPath = path.resolve(__dirname, '..', '..', 'public', 'images', 'stores', fileName);
					const storagePath = `images/stores/${fileName}`;
					console.log(storagePath, 'storagePath');
		
					// Use the mv() method to place the file somewhere on your server
		
					image.mv(uploadPath, function (err) {
						if (err) throw err;
					});
		
					if(store.image != null && store.image != "") {
						fs.unlinkSync(path.resolve(__dirname, '..', '..', 'public')+"/"+store.image);
					}
		
		
					 updatedStore = await Store.findByIdAndUpdate(
						req.params.id,
						{
							$set: {
								...req.body , 
								image : storagePath 
							},
						},
						{ new: true }
					);
				}else {
					console.log("im here");
					console.log(req.body);
					 updatedStore = await Store.findByIdAndUpdate(
						req.params.id,
						{
							$set: req.body,
						},
						{ new: true }
					);
		
				}
		
		
		
				return updatedStore;
			}
		}
	} catch (err) {
		console.log(err) ;
		throw err;
	}
};

//updateStore
exports.updateStoreRating = async (req) => {
	try {
		console.log(req.body);

		const store = await Store.findById(req.body.store_id);
		if (!Store) {
			throw new Error({ message: 'Store not found' });
		}
		
		const updateStoreRate = await StoreRate.findByIdAndUpdate(
			{
				storeId : req.body.storeId , 
				userId : req.body.userId ,  
			}
			, {
				rate : req.body.rate
			}, {
			new: true,
			upsert: true // Make this update into an upsert
		  });
		  
		  let old_sum = Store.ratingSum ; 
		  let old_count = Store.ratingCount ; 
		  const updatedStore = await Store.findByIdAndUpdate(
			  req.body.storeId,
			  {
				  ratingSum: old_sum + req.body.rate,
				  ratingCount : old_count+1
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
			if(!store.policy) {
				const seller = await User.findById(store.sellerId) ;
				if(seller) {
					store.policy = seller.policy ;
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
			let new_stores = [...stores] ; 
			
			const seller = await User.findById(req.user.id) ;

			new_stores.map(element => {
				if(!element.policy && seller) {
						element.policy = seller.policy ;
				}
				return element ; 
				
			}) ;
			console.log(new_stores);
			return new_stores;
		}
	} catch (err) {
		throw err;
	}
};
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
		await Product.deleteMany({storeId: req.params.storeId});

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
		console.log(result);
		return result;

	  }
	} catch (err) {
	  throw err;
	}
  };
  
   

