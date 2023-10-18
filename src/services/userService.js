const User = require('../models/User');
const fs = require('fs');

const CryptoJS = require('crypto-js');
const uuid = require('uuid');
const path = require('path');
const StoreCategory = require('../models/StoreCategory');

const { default: mongoose } = require('mongoose');
  
// Example usage
async function myAsyncStoreCategoryFunc(element) {
	// do some asynchronous operation with item
		if(element.id == null ||  element.id == "null") {
			let newStoreCategory = new StoreCategory({
				name : element.name 
			}) ;
			newStoreCategory = await newStoreCategory.save() ;
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

		
async function asyncMap(array, asyncFunc) {
	const promises = array.map(asyncFunc);
	return Promise.all(promises);
  }
  
//Update User

exports.updateUser = async (req) => {
	try {
		if (req.body.password) {
			req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.ACCESS_TOKEN_SECRET).toString();
		}
		
		if (typeof req.body.storeCategories === 'string') {
			req.body.storeCategories = JSON.parse(req.body.storeCategories);
			req.body.storeCategories = await asyncMap(req.body.storeCategories , myAsyncStoreCategoryFunc) ; 
			req.body.storeCategorieIds = req.body.storeCategories.map(e => {
				return mongoose.Types.ObjectId(e.id) ;
			})	;
			delete req.body.storeCategories ; 
			console.log(req.body.storeCategories) ;
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
			console.log(req.body.productCategorieIds) ;
		}
	
		
		if (typeof req.body.tags === 'string') {
			req.body.tags = JSON.parse(req.body.tags);
			req.body.tags = req.body.tags.map((e)=> {
				if(e.id) {
					return {name : e.name , _id : e.id} ; 
				}else {
					return {name : e.name } ; 
				}
			}) ; 	
			console.log(req.body.tags) ;
		}

		if (typeof req.body.notification === 'string') {
			req.body.notification = JSON.parse(req.body.notification);
			console.log(req.body.notification) ;
		}

		const updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			{
				$set: req.body,
			},
			{ new: true }
		).select('-password');
		console.log(updatedUser);
		if (updatedUser) {
		}
		return updatedUser;
	} catch (err) {
		console.log(err) ; 
		throw err;
	}
};

exports.updateUserImage = async(req) => {
	
	try {
		const user = await User.findById(req.params.id) ; 

		try {
			if(user && user.profileImage) {
				fs.unlinkSync(path.resolve(__dirname, '..', '..', 'public')+"/"+user.profileImage);
			  
				console.log("Delete File successfully.");
			}
		  } catch (error) {
			console.log(error);
		  }
		
		
		const image = req.files.image;
		//remove spaces from name
		image.name = image.name.replace(/\s/g, '');
		const fileName = `${uuid.v4()}${image.name}`;
		const uploadPath = path.resolve(__dirname, '..', '..', 'public', 'images', 'users', fileName);
		const storagePath = `images/users/${fileName}`;
		image.mv(uploadPath, function (err) {
			if (err) return console.log(err);
		});
		
		const updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			{
				profileImage : storagePath,
			},
			{ new: true }
		).select('-password');
		
		return updatedUser;
	} catch (err) {
		throw err;
	}
	
}

//delete user
exports.deleteUser = async (req) => {
	try {
		const deletedUser = await User.findByIdAndDelete(req.params.id);
		const { password, ...others } = deletedUser._doc;
		return others;
	} catch (err) {
		throw err;
	}
};
//get user by his id
exports.getUser = async (req) => {
	try {
		console.log('req.params.id', req.params.id);
		console.log('start');
		const user = await User.findById(req.params.id);
		const { password, ...others } = user._doc;
		console.log(others);
		return others;
	} catch (err) {
		throw err;
	}
};


//get user by his id
exports.welcome = async (req) => {
	try {	
		const updatedUser = await User.findByIdAndUpdate(
			req.params.id,
			{
				welcome: true ,
			},
			{ new: true }
		);		

		
		const user = await User.findById(req.params.id);
		const { password, ...others } = user._doc;

		return others;
		
		
	} catch (err) {
		throw err;
	}
};
//get all users
exports.getUsers = async (req) => {
	try {
		const users = await User.find();
		return users;
	} catch (err) {
		throw err;
	}
};
