const Product = require('../models/Product');
const Offer = require('../models/Offer');
const Store = require('../models/Store');
const uuid = require('uuid');
const path = require('path');
const fileUpload = require('express-fileupload');
const Category = require('../models/Category');
const { Cookies } = require('nodemailer/lib/fetch');
const StoreCategory = require('../models/StoreCategory');
const User = require('../models/User');

//get All Categories
exports.getAllCategories = async (req) => {
	try {
		console.log('getAllCategories');
		const categories = await Category.find().select('-__v');
		//delete all the productIds from the response
		return categories;
	} catch (err) {
		throw err;
	}
};

//get Categories by id populating products
exports.getCategoryById = async (req) => {
	try {
		const category = await Category.findById(req.params.id).where({confirm : true}).get();
		return category;
	} catch (err) {
		throw err;
	}
};


//get Categories by store categorie id
exports.getCategoryByStoreCategoryId = async (req) => {
	try {
		const category = await Category.find({
			storeCategoryId : req.params.id 
		});
		return category;
	} catch (err) {
		throw err;
	}
};



//get Categories by store categorie id
exports.getCategoryByStoreCategoryIds = async (req) => {
	try {
		console.log(req.body.storeCategories) ; 
		var storeCatIds = [] ; 
		if(req.body.storeCategories && typeof req.body.storeCategories === "string" ) {
			storeCatIds = JSON.parse(req.body.storeCategories) ; 
		}
		if(req.body.user_id && req.body.user_id != "") {
			console.log("user is here ") ;
			const user = await User.findById(req.body.user_id);
			if(!user) {
				throw "User not found" ; 
			}	
			let category = await Category.find({
				storeCategoryId : {$in : storeCatIds}, 
				// confirmed : true 
			});
			category = category.map(cat => {
				let cat_index = user.productCategorieIds.findIndex(el => el.categoryId.equals(cat._id)) ; 
				console.log(cat_index) ; 
				let cat_selected = cat_index != -1 ; 
				let sub_cats = cat.subCategories.map(el => {
					if(!cat_selected) {
						return {...el._doc , selected : false} ;
					}else {
						let sub_selected = user.productCategorieIds[cat_index].subCategories.findIndex(it => it.equals(el._id)) != -1 ; 
						return {...el._doc , selected : sub_selected} ;
					}
				})

				return {...cat._doc , subCategories : sub_cats ,selected : cat_selected } ;
			})
			return category;

		}else {
			const category = await Category.find({
				storeCategoryId : {$in : storeCatIds}, 
				// confirmed : true 
			});
			return category;
		}
	} catch (err) {
		throw err;
	}
};


//get Categories by store categorie id
exports.getCategoryByStoreId = async (req) => {
	try {
		console.log(req.params) ; 
		const store = await Store.findById(req.params.id);
		if (!store) {
			throw new Error({ message: 'Store not found' });
		} 
		var categoryIds = store.productCategorieIds.map(el => {
			return el.categoryId ; 
		}) ; 

		const subCategoryIds = store.productCategorieIds.flat().flatMap(element => element.subCategories) ; 
		
		const categories = await Category.find({
			_id : {$in : categoryIds}, 
			// confirmed : true 
		});

		const returned_categories = await asyncMap(categories ,myAsyncFuncProductCategoriesForStore , subCategoryIds , store._id) ; 

		

		var storeCategoryIds = store.storeCategorieIds ; 
		console.log("storeCategoryIds") ; 
		console.log(storeCategoryIds) ; 

		var StoreCategories = await StoreCategory.find({
			_id : {$in : storeCategoryIds}, 
			// confirmed : true 
		});
		console.log("StoreCategories") ; 
		console.log(StoreCategories) ; 

		StoreCategories = StoreCategories.map(el => {
			return {...el._doc , selected : true }  ;
		}) ;
		console.log("StoreCategories 2") ; 
		console.log(StoreCategories) ; 

		console.log("result ") ; 
		console.log({
			ProductCategories : returned_categories , 
			StoreCategories : StoreCategories
		}) ;

		return {
			ProductCategories : returned_categories , 
			StoreCategories : StoreCategories
		};
		
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
			let element = {...el._doc , selected : true } ; 
			let product_number = await Product.count({categoryId : element._id , storeId : storeId }) ; 
			element = {...element , product_count : product_number} ; 
			element.subCategories = await  asyncMap(element.subCategories , myAsyncFuncProductSubCategoriesForStore , values , storeId) ;
			return element ; 
} 
// Example usage
async function myAsyncFuncProductSubCategoriesForStore(sub , values , storeId) {
	sub = {...sub._doc} ; 
	let product_number = await Product.count({subCategoryId : sub._id , storeId : storeId }) ; 
	sub = {...sub , product_count : product_number} ; 


	let store_product_categorie_index = values.findIndex(p_cat => {
		if(p_cat) {
			return p_cat.equals(sub._id) ; 
		}else {
			return -1
		}
	}) ;
	
	if(
		store_product_categorie_index != -1
		) {
		return {...sub , selected : true } ;
	}else {
		return {...sub , selected : false } ;
	}
}


//Creat Category
exports.createCategory = async (req) => {
	try {
		//check if image exists
		if(typeof req.body.subCategories === "string" && req.body.subCategories != "" ) {
			req.body.subCategories = JSON.parse(req.body.subCategories) ; 
		}else {
			req.body.subCategories = [] ;
		}
		
		const newCategory = new Category({
			name: req.body.name,
			subCategories : req.body.subCategories
		});
		await newCategory.save();
		return newCategory;
		
	} catch (err) {
		throw err;
	}
};


//Creat Category
exports.addSubCategory = async (req) => {
	try {
		//check if image exists
		if(typeof req.body.subCategories === "string" && req.body.subCategories != "" ) {
			req.body.subCategories = JSON.parse(req.body.subCategories) ; 
		}else {
			req.body.subCategories = [] ;
		}
		
		const newCategory = new Category({
			name: req.body.name,
			subCategories : req.body.subCategories
		});
		await newCategory.save();
		return newCategory;
		
	} catch (err) {
		throw err;
	}
};



//delete Category
exports.deleteCategory = async (req) => {
	try {
		verifyAdmin(req);
		const { error } = categorySchema.validate(req.body);
		if (error) throw Error(error.details[0].message);
		const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!category) throw Error('The category with the given ID was not found.');
		return category;
	} catch (err) {
		throw err;
	}
};

//get the categories for a store
exports.getCategoriesForStore = async (req) => {
	try {
		//check if the store exists
		const store = await Store.findById(req.params.id);
		if (!store) throw Error('The store with the given ID was not found.');

		var storeCategories = [] ;

		if(store.productCategorieIds && store.productCategorieIds.length) {
			storeCategories = store.productCategorieIds.map((cat) => cat.categoryId) ;
		}

		//get the names of the categories of the store
		const categories = await (
			await Category.find({
				_id: {
					$in: storeCategories
				} 
			}) 
		)
			.map((category) => {
				return category.name;
			})
			.sort();
		return categories;
	} catch (err) {
		throw err;
	}
};

//get categories names for a store
exports.getCategoriesNamesForStore = async (req) => {
	try {
		//check if the category exists
		console.log(req.params.category, 'category');
		console.log(req.params.id, 'store id');

		const category = await Category.findOne({ name: req.params.category });
		if (!category) throw Error('The category with the given name was not found.');
		//get the products of the category
		const products = await Product.find().where('categoryId').equals(category._id);
		return products;
	} catch (err) {
		throw err;
	}
};
//update category
exports.updateCategory = async (req) => {
	try {
		const { error } = categorySchema.validate(req.body);
		if (error) throw Error(error.details[0].message);
		
		if(typeof req.body.subCategories === "string" && req.body.subCategories != "" ) {
			req.body.subCategories = JSON.parse(req.body.subCategories) ; 
		}

		const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!category) throw Error('The category with the given ID was not found.');
		return category;
	} catch (err) {
		throw err;
	}
};
