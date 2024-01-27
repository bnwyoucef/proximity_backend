const Product = require('../models/Product');
const Store = require('../models/Store');
const Category = require('../models/Category');
const uuid = require('uuid');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const Order = require('../models/Order');
const User = require('../models/User');
const View = require('../models/View');
const { default: mongoose } = require('mongoose');
const { localSendNotification } = require('./notificationsService');

//Update product
exports.updateProduct = async (req) => {
	try {
		console.log(req.body);
		// Validation request
		const product = await Product.findById(req.params.id);
		//test if the product is existe
		if (!product) throw new Error('The product with the given ID was not found.');
		const category = await Category.findById(req.body.categoryId);
		//test the Owner Product
		if (product.sellerId != req.user.id) {
			throw new Error('You are not authorized to perform this action.');
		} //test that the category ID existe
		if (!category) throw new Error('The category with the given ID was not found.');
		const store = await Store.findById(req.body.storeId);
		//test that the Strore with the entred id existe
		if (!store) throw new Error('The store with the given ID was not found.');
		//search the varient in the product
		// for (let i = 0; i < req.body.variantes.length; i++) {
		// 	const varient = req.body.variantes[i];
		// 	const varientInProduct = product.variants.find((v) => v._id == varient._id);
		// 	//test that the varient is in the product
		// 	//test the varient Id
		// 	if (!varientInProduct) throw new Error('The varient with the given ID' + varient._id + ' was not found.');
		// 	//update the varient

		// 	varientInProduct.quantity = varient.quantity;
		// 	varientInProduct.price = varient.price;
		// 	//varientInProduct.img = varient.image;
		// 	varientInProduct.characterstics = varient.characterstics;
		// 	product.variants[i] = varientInProduct;
		// }
		//Update the product

		if (req.body.variantes && req.files && req.files.varientsImages) {
			let varientsImages = [];
			product.variants.forEach((variant, index) => {
				fs.unlink('images/variantes/' + variant.img.split('/')[2], (err) => {
					if (err) {
						console.log('Error when Delete File[' + index + '].');
					}

					console.log('Delete File[' + index + '] successfully.');
				});
			});
			for (let i = 0; i < req.body.variantes.length; i++) {
				if (!req.files.varientsImages) {
					throw new Error('No files were uploaded.');
				}
				const image = req.files.varientsImages[i];
				//remove spaces from the name
				image.name = image.name.replace(/\s/g, '');
				const fileName = `${uuid.v4()}${image.name}`;
				const uploadPath = path.resolve(__dirname, '..', '..', 'public', 'images', 'variantes', fileName);
				const storagePath = `images/variantes/${fileName}`;
				image.mv(uploadPath, function (err) {
					if (err) return console.log(err);
				});
				req.body.variantes[i].img = storagePath;
				varientsImages.push(storagePath);
			}
		}
		console.log(req.body.variantes);
		product.variants = req.body.variantes;

		if (
			req.body.variantes &&
			req.body.variantes.length == 1 &&
			product.variants != null &&
			product.variants.length == 1 &&
			req.body.variantes[0].characterstics[0].value == req.body.name
		) {
			product.variants[0].price = req.body.price;
			console.log('req.body.quantity');
			console.log(req.body.quantity);
			product.variants[0].quantity = req.body.variantes[0].quantity;
			product.variants[0].img = product.images[0];
		}

		product.name = req.body.name || product.name;
		product.price = req.body.price || product.price;
		product.description = req.body.description || product.description;
		product.tags = req.body.tags || product.tags;
		product.discount = req.body.discount || product.discount;
		product.images = req.body.images || product.images;
		product.storeId = req.body.storeId || product.storeId;
		product.policy = req.body.policy || product.policy;
		product.categoryId = req.body.categoryId || product.categoryId;
		product.subCategoryId = req.body.subCategoryId || product.subCategoryId;
		product.storeCategoryId = req.body.storeCategoryId || product.storeCategoryId;
		product.rayonId = req.body.rayonId || product.rayonId;
		//save the product with previos varients
		console.log(product.variants);
		await product.save();
		return product;
	} catch (error) {
		console.log(error);
		throw error;
	}
};
//Update product Search number
exports.updateNumberOfViews = async (req) => {
	try {
		// Validation request
		//const numberOfS= parseInt(req.body.numberOf);
		//console.log("product") ;
		const product = await Product.findById(req.params.id);
		//test if the product is existe
		if (!product) throw new Error('The product with the given ID was not found.');
		product.numberOfViews += 1;
		await product.save();
		const view = new View({
			sellerId: product.sellerId,
			storeId: product.storeId,
			productId: product.id,
			date: new Date(),
			region: req.query.city, // Pass the region data for each view, or remove this line if not applicable
		});
		await view.save();
		return product;
	} catch (error) {
		console.log(error);
		throw error;
	}
	//test the Owner Product}
};

exports.getProductSales = async (req) => {
	try {
		// Find all products for the given sellerId and populate the seller information
		const products = await Product.find({ sellerId: req.user.id });
		// Calculate the number of sales and income for each product
		const productsSales = products.map((product) => {
			const productName = product.name;
			const numberOfSales = product.numberOfSales; // Assuming the sales are stored as an array in the 'sales' field of the Product model
			const income = numberOfSales * product.price;
			const numberOfViews = product.numberOfViews;
			return {
				productName, // Spread the existing product object
				numberOfSales,
				income,
				numberOfViews,
			};
		});

		return productsSales;
	} catch (err) {
		throw err;
	}
};

//Update product Sales number
exports.updateNumberOfSales = async (req) => {
	try {
		// Validation request
		console.log('product');
		const product = await Product.findById(req.params.id);
		const numberOfSales = parseInt(req.body.numberOfSales);

		//test if the product is existe
		if (!product) throw new Error('The product with the given ID was not found.');
		product.numberOfSales += numberOfSales;
		await product.save();
		return product;
	} catch (error) {
		console.log(error);
		throw error;
	}
	//test the Owner Product}
};
//Add Product
exports.addProduct = async (req) => {
	try {
		//check if store exist
		//check the id of the store

		const store = await Store.findById(req.body.storeId);
		if (!store) throw new Error('The store with the given ID was not found.');
		//check store owner
		if (store.sellerId != req.user.id) {
			throw new Error('You are not authorized to perform this action.');
		}
		//check if category exist
		const category = await Category.findById(req.body.categoryId);
		if (!category) throw new Error('The category with the given ID was not found.');

		//upload the images
		if (!req.files || Object.keys(req.files).length === 0) {
			throw new Error('No files were uploaded.');
		}

		let imagess = [];
		for (let i = 0; i < req.files.images.length; i++) {
			const image = req.files.images[i];
			//remove spaces from name
			image.name = image.name.replace(/\s/g, '');
			const fileName = `${uuid.v4()}${image.name}`;
			const uploadPath = path.resolve(__dirname, '..', '..', 'public', 'images', 'products', fileName);
			const storagePath = `images/products/${fileName}`;
			image.mv(uploadPath, function (err) {
				if (err) return console.log(err);
			});
			imagess.push(storagePath);
		}

		//upload the varients photos
		//loop through the varients
		let varientsImages = [];
		for (let i = 0; i < req.body.variantes.length; i++) {
			if (!req.files.varientsImages) {
				throw new Error('No files were uploaded.');
			}
			const image = req.files.varientsImages[i];
			//remove spaces from the name
			image.name = image.name.replace(/\s/g, '');
			const fileName = `${uuid.v4()}${image.name}`;
			const uploadPath = path.resolve(__dirname, '..', '..', 'public', 'images', 'variantes', fileName);
			const storagePath = `images/variantes/${fileName}`;
			image.mv(uploadPath, function (err) {
				if (err) return console.log(err);
			});
			req.body.variantes[i].img = storagePath;
			varientsImages.push(storagePath);
		}
		console.log('abdou');

		const newProduct = new Product({
			name: req.body.name,
			price: req.body.price,
			description: req.body.description,
			images: imagess,
			subcategory: req.body.subcategory || '',
			sellerId: req.user.id,
			storeId: store._id,
			discount: req.body.discount,
			variants: req.body.variantes,
			priceMin: req.body.priceMin,
			priceMax: req.body.priceMax,
			policy: req.body.policy,
			storeCategoryId: req.body.storeCategoryId,
			categoryId: req.body.categoryId,
			subCategoryId: req.body.subCategoryId,
			rayonId: req.body.rayonId,
		});
		const savedProduct = await newProduct.save();
		// get users notified

		const regexPatternTitle = new RegExp(`\\b${savedProduct.name}\\b`, 'i');
		const regexPatternDescription = new RegExp(`\\b${savedProduct.description}\\b`, 'i');

		let users = await User.find({ _id: '6491ed986b54174db78c0695' });
		// let users = await User.aggregate([
		// 	{
		// 	  $match: {
		// 		$and: [
		// 			{
		// 				notification : {
		// 				offerNotification : true
		// 				}
		// 			} ,
		// 			{
		// 				productCategorieIds: {
		// 				$elemMatch: {
		// 				  subCategories: savedProduct.subCategoryId
		// 				}
		// 			  }
		// 			},
		// 			{
		// 				$or : [
		// 					{
		// 						Tags: {
		// 						$regex: regexPatternTitle,
		// 						$options: 'i'
		// 						}
		// 					},
		// 					{
		// 						Tags: {
		// 						$regex: regexPatternDescription,
		// 						$options: 'i'
		// 						}
		// 					},

		// 				]
		// 			}
		// 		]
		// 	  }
		// 	},
		// 	{ $limit: 10 } // Limit the search results to 10
		//   ]).toArray();

		// if(users.length < 10) {
		// 	let usersSup = await User.aggregate([
		// 		{
		// 		  $match: {
		// 			$and: [
		// 				{
		// 					notification : {
		// 					offerNotification : true
		// 					}
		// 				} ,
		// 				{
		// 					_id: {
		// 					$nin: users.map(el => el._id)
		// 					}
		// 				} ,
		// 				{
		// 					$or: [
		// 					{
		// 						productCategorieIds: {
		// 						$elemMatch: {
		// 							subCategories: savedProduct.subCategoryId
		// 						}
		// 					}
		// 					},
		// 					{
		// 						$or : [
		// 							{
		// 								Tags: {
		// 								$regex: regexPatternTitle,
		// 								$options: 'i'
		// 								}
		// 							},
		// 							{
		// 								Tags: {
		// 								$regex: regexPatternDescription,
		// 								$options: 'i'
		// 								}
		// 							},

		// 						]
		// 					}
		// 				]
		// 				},
		// 			]
		// 		  }
		// 		},
		// 		{ $limit: 10 } // Limit the search results to 10
		// 	  ]).toArray();
		//  users = users.concat(usersSup);
		// }
		console.log(users);
		// send product notifications to users
		if (users.length) {
			let data = {
				owner_id: users.map((el) => el._id),
				type: 'offer', // order or offer
				sub_type: 'product', // for the icon
				id: savedProduct._id, // get order or offer and go to the page
			};

			let title = 'New Product :' + savedProduct.name;
			let content = savedProduct.description;

			await localSendNotification(title, content, data);
		}
		return savedProduct;
	} catch (err) {
		console.log(err.message);
		throw err;
	}
};
//delete product
exports.deleteProduct = async (req) => {
	console.log(req.params);
	try {
		let product = await Product.findById(req.params.id);
		if (!product) {
			console.log('makach');
			throw new Error('Product not found');
		}
		if (product.sellerId != req.user.id) {
			console.log('khatik');
			throw new Error('its not your product');
		}

		// delete images

		let images_to_delete = product.images;

		if (product.variants) {
			let variant_images = product.variants.map((el) => el.img);
			images_to_delete.push(...variant_images);
		}

		//check if any image exist in orders

		// get orders->products->image exit in images_to_delete

		let orders = Order.find({
			products: {
				image: { $in: images_to_delete },
			},
		});
		if (orders && orders.length) {
			orders.forEach((order) => {
				images_to_delete = images_to_delete.filter((el) => order._doc.products.findIndex((prod) => prod.image == el) != -1);
			});
		}

		images_to_delete.forEach((image) => {
			try {
				if (image) {
					fs.unlinkSync(path.resolve(__dirname, '..', '..', 'public') + '/' + image);

					console.log('Delete File successfully.');
				}
			} catch (error) {
				console.log(error);
			}
		});

		await Product.findByIdAndDelete(req.params.id);
		const category = await Category.findById(product.categoryId);
		// if (category) {
		// 	const index = category.productIds.indexOf(product._id);
		// 	category.productIds.splice(index, 1);
		// 	await category.save();
		// 	if (category.productIds.length == 0) {
		// 		await Category.findByIdAndDelete(category._id);
		// 	}
		// }
		return { message: 'Product deleted successfully' };
	} catch (err) {
		console.log(err);
		throw err;
	}
};
//get product by id
exports.getProduct = async (req) => {
	try {
		let product = await Product.findById(req.params.id);
		if (product == null) {
			throw new Error({ message: 'Product not found' });
		} else {
			if (!product.policy) {
				const store = await Store.findById(product.storeId);
				if (store) {
					if (store.policy) {
						product.policy = store.policy;
					} else {
						const seller = await User.findById(store.sellerId);
						if (seller) {
							product.policy = seller.policy;
						}
					}
				}
			}
			console.log(product);
			return product;
		}
	} catch (err) {
		console.log(err);
		throw err;
	}
};
//get all products for a store
exports.getProducts = async (req) => {
	console.log('req.body');
	console.log(req.body);
	try {
		const store = await Store.findById(req.params.id);
		if (!store) {
			throw new Error('Store not found');
		}
		var products = [];
		if (req.body.rayonId) {
			products = await Product.find({ storeId: req.params.id, rayonId: mongoose.Types.ObjectId(req.body.rayonId) });
		} else {
			products = await Product.find({ storeId: req.params.id });
		}
		return products;
	} catch (err) {
		console.log(err);
		throw err;
	}
};
//get limit products for a store
exports.getProductsLimit = async (req) => {
	try {
		const store = await Store.findById(req.params.id);
		if (!store) {
			throw new Error('Store not found');
		}
		const products = await Product.find({ storeId: req.params.id })

			.limit(parseInt(req.params.limit))
			.sort({ createdAt: -1 });
		return products;
	} catch (err) {
		throw err;
	}
};

//search product by his name
exports.searchProduct = async (req) => {
	try {
		const products = await Product.find({ name: { $regex: req.params.name } });
		return products;
	} catch (err) {
		throw err;
	}
};
//search product by his name and store id
exports.searchProductStore = async (req) => {
	try {
		var products = [];
		products = await Product.find({
			name: { $regex: req.params.name },
			storeId: req.params.id,
		});
		return products;
	} catch (err) {
		throw err;
	}
};
exports.reportProduct = async (req) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) {
			throw new Error('Product not found');
		}
		let idUser = req.user.id;
		product.reports.push({ idUser, message: req.body.message, date: Date.now() });
		await product.save();
		return product;
	} catch (err) {
		throw err;
	}
};
//get all reports for a product
exports.getReports = async (req) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) {
			throw new Error('Product not found');
		}
		return product.reports;
	} catch (err) {
		throw err;
	}
};
//get all reported products
exports.getReportedProducts = async (req) => {
	try {
		const products = await Product.find({ reports: { $exists: true } });
		return products;
	} catch (err) {
		throw err;
	}
};
