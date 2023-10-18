const Product = require('../models/Product');
const Store = require('../models/Store');
const StoreCategory = require('../models/StoreCategory');

const { default: mongoose } = require('mongoose');
const User = require('../models/User');
//get All StoreCategories
exports.getAllStoreCategories = async (req) => {
	try {
		console.log('getAllStoreCategories');
		const StoreCategories = await StoreCategory.find({
			// confirmed : true
		 }).select('-__v');
		//delete all the productIds from the response
		return StoreCategories;
	} catch (err) {
		throw err;
	}
};


//get All StoreCategories
exports.getAllStoreCategoriesOfaClient = async (req) => {
	try {
		console.log(req.params) ; 
		console.log('abdou of a store');
		const user = await User.findById(req.params.id);
		if (!user) {
			throw new Error({ message: 'User not found' });
		} 
		console.log(user) ; 

		const catsStore = user.storeCategorieIds ; 

		const StoreCategories = await StoreCategory.find({
			// confirmed : true
		 }).select('-__v');

		 const returnedCategories = await asyncMap(StoreCategories , myAsyncFuncProductCategoriesForStore, catsStore , user._id) ; 
		//delete all the productIds from the response
		console.log(returnedCategories) ; 
		return returnedCategories;
	} catch (err) {
		console.log(err) ; 
		throw err;
	}
};
//get All StoreCategories
exports.getAllStoreCategoriesOfaStore = async (req) => {
	try {
		console.log(req.params) ; 
		console.log('abdou of a store');
		const store = await Store.findById(req.params.id);
		if (!store) {
			throw new Error({ message: 'Store not found' });
		} 
		console.log(store) ; 

		const catsStore = store.storeCategorieIds ; 

		const StoreCategories = await StoreCategory.find({
			// confirmed : true
		 }).select('-__v');

		 const returnedCategories = await asyncMap(StoreCategories , myAsyncFuncProductCategoriesForStore, catsStore , store._id) ; 
		//delete all the productIds from the response
		console.log(returnedCategories) ; 
		return returnedCategories;
	} catch (err) {
		console.log(err) ; 
		throw err;
	}
};

async function asyncMap(array, asyncFunc , values , storeId) {
	const promises = array.map(el => asyncFunc(el , values , storeId));
	return Promise.all(promises);
  }
  
// Example usage
async function myAsyncFuncProductCategoriesForStore(el , values , storeId) {
	
	let element = {...el._doc} ; 

	let products_num = 0 ; 

	if(storeId) {
	 products_num = await Product.count({storeCategoryId : element._id , storeId : storeId}) ;

	}else {
		products_num = await Product.count({storeCategoryId : element._id }) ;

	}

	element = {...element , product_count : products_num} ; 

	if(values.findIndex(cat => {
		return cat.equals(element._id) ; 
	}) != -1) {
		element = {...element , selected : true } ; 
	}
	return element ; 
} 



//get StoreCategories by id populating products
exports.getStoreCategoryById = async (req) => {
	try {
		const StoreCategory = await StoreCategory.findById(req.params.id);
		return StoreCategory;
	} catch (err) {
		throw err;
	}
};
//Creat StoreCategory
exports.createStoreCategory = async (req) => {
	try {
		//check if image exists
		if (!req.body.name || req.body.name == "") return console.log('You must enter the name of the category.');
		else {
			const newStoreCategory = new StoreCategory({
				name: req.body.name
			});
			await newStoreCategory.save();
			return newStoreCategory;
		}
	} catch (err) {
		throw err;
	}
};

//delete StoreCategory
exports.deleteStoreCategory = async (req) => {
	try {
		verifyAdmin(req);
		const StoreCategoryTest = await StoreCategory.findById(req.params.id);
		if (!StoreCategoryTest) throw Error('The StoreCategory with the given ID was not found.');
		const StoreCategory = await StoreCategory.findByIdAndDelete(req.params.id);
		return StoreCategory;
	} catch (err) {
		throw err;
	}
};

//update StoreCategory
exports.updateStoreCategory = async (req) => {
	try {
		
		const StoreCategoryTest = await StoreCategory.findById(req.params.id);
		if (!StoreCategoryTest) throw Error('The StoreCategory with the given ID was not found.');
		const StoreCategory = await StoreCategory.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		return StoreCategory;
	} catch (err) {
		throw err;
	}
};
