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
const StoreCategory = require('../models/StoreCategory');
const Category = require('../models/Category');

const { default: mongoose } = require('mongoose');
const { getCategoryByStoreId } = require('./categoryService');

async function asyncMap(array, asyncFunc) {
	const promises = array.map(asyncFunc);
	return Promise.all(promises);
  }
  
  async function asyncMap2(array, asyncFunc , storeId) {
	const promises = array.map(el => asyncFunc(el  , storeId));
	return Promise.all(promises);
  }
  
// Example usage
async function myAsyncStoreCategoryFunc(element) {
// do some asynchronous operation with item
	if(element.id == null ||  element.id == "null") {
		let newStoreCategory = new StoreCategory({
			name : element.name 
		}) ;
		newStoreCategory = await newStoreCategory.save() ;
		element.Oldid = element.id ; 
		element.Oldeid = element.eid ; 
		element.id = newStoreCategory._id ; 
	}
	return element ; 
}

async function myAsyncProductCategoryFunc(element) {
	// do some asynchronous operation with item
		element.subCategories = JSON.parse(element.subCategories) ;

		if(element.id == null ||  element.id == "null") {
			let newCategory = new Category({
				name : element.name , 
				confirmed : false , 
				storeCategoryId : element.storeCategoryDBId ,
				subCategories : element.subCategories.map((e) => {return {name : e.name , confirmed : false} ; }) 
			}) ;
			newCategory = await newCategory.save() ;
			element.subCategories = element.subCategories.map(e => {
				let catIndex = newCategory.subCategories.findIndex(el => el.name == e.name) ;
				if(catIndex != -1) {
					e.id = newCategory.subCategories[catIndex]._id ; 
				}
				return e ; 
			})
			element.id = newCategory._id ; 
		}
		return element ; 
	}

//createStore
exports.createStore = async (req) => {
	console.log("req.body") ; 
	console.log(req.body) ; 
	console.log(req.files) ; 
	try {
		if (typeof req.body.location === 'string') {
			req.body.location = JSON.parse(req.body.location);
		}
		if (typeof req.body.address === 'string') {
			req.body.address = JSON.parse(req.body.address);
		}
		let storeCategories = [] ; 
		if (typeof req.body.storeCategories === 'string') {
			storeCategories = JSON.parse(req.body.storeCategories);
			storeCategories = await asyncMap(storeCategories , myAsyncStoreCategoryFunc) ; 	
		}
		let productCategories = [] ; 
		if (typeof req.body.productCategories === 'string') {
			productCategories = JSON.parse(req.body.productCategories);
			productCategories.map(element => {
				if (element.storeCategoryDBId == null) {
					let newStoreCategorieId = storeCategories.filter(el => el.Oldeid == element.storeCategoryId )[0].id ; 
					element.storeCategoryDBId = newStoreCategorieId ; 
				}
				return element ;
			});
			productCategories = await asyncMap(productCategories , myAsyncProductCategoryFunc) ; 	
		}
	
		
		let storeRayon = [] ; 
		if (typeof req.body.storeRayons === 'string') {
			storeRayon = JSON.parse(req.body.storeRayons);
			storeRayon = storeRayon.map((e)=> {
				return {name : e.name} ; 
			}) ; 	
		}
	
		// console.log(req.body.policy);
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
			templateId : parseInt(req.body.template) , 
			storeRayons : storeRayon ,
			storeCategorieIds : storeCategories.map(e => {
				return e.id ;
			})  ,
			productCategorieIds : productCategories.map(e => {
				let subCategoriesIds = e.subCategories.map(s => {
					return s.id ;
				}) ; 
				return {categoryId : e.id , subCategories : subCategoriesIds}
			})
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
			if (typeof req.body.location === 'string') {
				req.body.location = JSON.parse(req.body.location);
			}
			if (typeof req.body.address === 'string') {
				req.body.address = JSON.parse(req.body.address);
			}
			if (typeof req.body.storeCategories === 'string') {
				req.body.storeCategories = JSON.parse(req.body.storeCategories);
				req.body.storeCategories = await asyncMap(req.body.storeCategories , myAsyncStoreCategoryFunc) ; 
				req.body.storeCategorieIds = req.body.storeCategories.map(e => {
					return mongoose.Types.ObjectId(e.id) ;
				})	;
				delete req.body.storeCategories ; 
			}

			if (typeof req.body.productCategories === 'string') {
				req.body.productCategories = JSON.parse(req.body.productCategories);
				req.body.productCategorieIds = await asyncMap(req.body.productCategories , myAsyncProductCategoryFunc) ; 
				req.body.productCategorieIds = req.body.productCategorieIds.map(e => {
					let subCategoriesIds = e.subCategories.map(s => {
						return s.id ;
					}) ; 
					return {categoryId : e.id , subCategories : subCategoriesIds}
				})	
				delete req.body.productCategories ;
			}
		
			
			if (typeof req.body.storeRayons === 'string') {
				req.body.storeRayons = JSON.parse(req.body.storeRayons);
				req.body.storeRayons = req.body.storeRayons.map((e)=> {
					if(e.id) {
						return {name : e.name , _id : e.id} ; 
					}else {
						return {name : e.name } ; 
					}
				}) ; 	
			}
			if(req.body.template != null) {
				req.body.templateId = parseInt(req.body.template) ;
				delete req.body.template ; 

			}
			
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
					console.log("im here without image");
					console.log(req.body);
					 updatedStore = await Store.findByIdAndUpdate(
						req.params.id,
						{
							$set: req.body,
						},
						{ new: true }
					);		
				}
		
		
				console.log(updatedStore.storeCategorieIds) ; 
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
			new_stores = await asyncMap(new_stores , myAsyncSellerStoreFunc) ; 
			console.log(new_stores[new_stores.length-1]);
			return new_stores;
		}
	} catch (err) {
		console.log(err) ; 
		throw err;
	}
};

exports.getSellerStore = async (req) => {
	try {
		const store = await Store.findById(req.params.id );
		if (!store) {
			throw new Error({ message: 'Store not found' });
		} else {
			let new_stores = [store] ; 
			
			const seller = await User.findById(req.user.id) ;

			new_stores.map(element => {
				if(!element.policy && seller) {
						element.policy = seller.policy ;
				}
				return element ; 
				
			}) ;
			new_stores = await asyncMap(new_stores , myAsyncSellerStoreFunc) ; 
			console.log(new_stores[new_stores.length-1]);
			return new_stores[0];
		}
	} catch (err) {
		console.log(err) ; 
		throw err;
	}
};



exports.getSellerCategoriesAndRayons = async (req) => {
	try {
		const store = await Store.findById(req.params.id );
		if (!store) {
			throw new Error({ message: 'Store not found' });
		} else {
			let new_stores = [store] ; 
			
			const seller = await User.findById(req.user.id) ;

			new_stores.map(element => {
				if(!element.policy && seller) {
						element.policy = seller.policy ;
				}
				return element ; 
				
			}) ;
			new_stores = await asyncMap(new_stores , myAsyncSellerStoreFunc) ; 
			console.log(new_stores[new_stores.length-1]);

			var cats = await getCategoryByStoreId({params : {
				id : new_stores[0]._id
			}}) ; 

			console.log( {
				rayons : new_stores[0].storeRayons , 
				cats : cats.ProductCategories

			}) ;
			return {
				rayons : new_stores[0].storeRayons , 
				cats : cats.ProductCategories

			};
		}
	} catch (err) {
		console.log(err) ; 
		throw err;
	}
};

async function myAsyncSellerStoreFunc(element) {
// do some asynchronous operation with item
if(element.storeRayons)  {
	let newstoreRayons = await asyncMap2(element.storeRayons , myAsyncSellerStoreRayonFunc , element._id) ; 
	return {...element._doc , storeRayons : newstoreRayons} ; 

}
return element ; 
}

async function myAsyncSellerStoreRayonFunc(element , storeId) {
// do some asynchronous operation with item
	let product_number = await Product.count({rayonId : element._id , storeId : storeId}) ; 
	element = {...element._doc , product_count : product_number , selected : true } ; 
	return element ; 
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
		await Product.deleteMany({storeId: req.params.storeId});

		await Store.findByIdAndDelete(req.params.storeId);
		
		return { message: 'Product deleted successfully' };
	} catch (err) {
		throw err;
	}
};
