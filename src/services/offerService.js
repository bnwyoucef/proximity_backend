const Product = require('../models/Product');
const Offer = require('../models/Offer');
const Store = require('../models/Store');
const User = require('../models/User');
const { localSendNotification } = require('./notificationsService');

//ceate offer
exports.createOffer = async (req) => {
	try {
		//check if he is the product owner
		const product = await Product.findOne({ _id: req.body.productId });
		if (!product || product.deleted || product.sellerId.toString() !== req.user.id.toString()) {
			throw Error('Product does not exist');
		}
		if (product.offer) {
			throw Error('Product already has an offer');
		}

		if (product.quantity < req.body.offerStock) {
			throw Error('Quantity is not available');
		}

		const offer = new Offer({
			sellerId: product.sellerId,
			storeId: product.storeId,
			productId: req.body.productId,
			//offerPrice: req.body.offerPrice,
			offerStock: req.body.offerStock,
			offerExpiration: req.body.offerExpiration,
			//offerStatus: req.body.offerStatus,
			discountType: req.body.discountType,
			offerImage: req.body.offerImage,
			offerName: req.body.offerName,
			offerDescription: req.body.offerDescription,
			offerDiscount: req.body.offerDiscount,
		});
		await offer.save();
		//assign offer to product
		let savedProduct = await Product.findOneAndUpdate({ _id: req.body.productId }, 
			{ 
				offer: offer._id , 
				discountType: req.body.discountType, 
				discount: req.body.offerDiscount,
				discountExpiration: req.body.offerExpiration,
		});
		console.log(savedProduct) ; 
		if(savedProduct != null) {
			// get users notified 
			
			const regexPatternTitle = new RegExp(`\\b${savedProduct.name}\\b`, 'i');
			const regexPatternDescription = new RegExp(`\\b${savedProduct.description}\\b`, 'i');
			let users = await User.find({_id : "6491ed986b54174db78c0695"}) ; 
	
			// let users = await User.aggregate([
			// 	{
			// 	  $match: {
			// 		$and: [
			// 			{
			// 				notification : {
			// 				offerNotification : true
			// 				} 
			// 			} ,
						// { 
						// 	productCategorieIds: {
						// 	$elemMatch: {
						// 	  subCategories: savedProduct.subCategoryId
						// 	}
						//   } 
						// },
						// {
						// 	$or : [
						// 		{
						// 			Tags: {
						// 			$regex: regexPatternTitle,
						// 			}
						// 		},
						// 		{
						// 			Tags: {
						// 			$regex: regexPatternDescription,
						// 			}
						// 		},
	
						// 	]
						// }
			// 		]
			// 	  }
			// 	},
			// 	{ $limit: 10 } // Limit the search results to 10
			//   ]);
			  console.log("users 1") ;
			  console.log(users) ;
	
			if(users.length < 10) {
				let usersSup = await User.aggregate([
					{
					  $match: {
						$and: [
							{
								notification : {
								offerNotification : true
								}
							} ,
							{
								_id: {
								$nin: users.map(el => el._id)
								}
							} ,
							// {
							// 	$or: [
							// 	{ 
							// 		productCategorieIds: {
							// 		$elemMatch: {
							// 			subCategories: savedProduct.subCategoryId
							// 		}
							// 	} 
							// 	},
							// 	{
							// 		$or : [
							// 			{
							// 				Tags: {
							// 				$regex: regexPatternTitle,
							// 				}
							// 			},
							// 			{
							// 				Tags: {
							// 				$regex: regexPatternDescription,
							// 				}
							// 			},
			
							// 		]
							// 	}
							// ]
							// },
						]
					  }
					},
					{ $limit: 10 } // Limit the search results to 10
				  ]);
			 users = users.concat(usersSup);
			}
			console.log("users 2") ;
			console.log(users) ; 
			// send product notifications to users 
			if(users.length)  {
				let data = {
					owner_id : users.map(el => el._id) , 
					type : "offer" , // order or offer
					sub_type : "offer" , // for the icon
					id : savedProduct._id // get order or offer and go to the page 
				};
		
				let title = "New Product Offer :"+savedProduct.name+" -"+parseFloat(req.body.offerDiscount)*100+"% !" ; 
				let content = savedProduct.description ;
		
				await localSendNotification(title , content , data) ;
	
			}
		}

		return offer;
	} catch (error) {
		console.log(error) ; 
		throw Error(error);
	}
};

//get all offers for a store
exports.getOffers = async (req) => {
	try {
		const offers = await Offer.find({ storeId: req.params.storeId });//.populate('productId');
		

		if (!offers) {
			throw Error('Offers not found');
		}
		return offers;
	} catch (error) {
		throw Error(error);
	}
};
//get offer by id
exports.getOfferById = async (req) => {
	try {
		console.log(req.params.id);
		const offer = await Offer.findOne({ _id: req.params.id }).populate('storeId');
		if (!offer) {
			throw Error('Offer not found');
		}
		return offer;
	} catch (error) {
		throw Error(error);
	}
};
//get offer by  product id
exports.getOfferBy = async (req) => {
	try {
		console.log(req.params.id);
		const offer = await Offer.findOne({ productId: req.params.id }).populate('productId');
		if (!offer) {
			throw Error('ot found');
		}
		return offer;
	} catch (error) {
		throw Error(error);
	}
};
//update offer
exports.updateOffer = async (req) => {
	try {
		const offer = await Offer.findOne({ _id: req.params.id });
		if (!offer) {
			throw Error('Offer not found');
		}
		if (offer.sellerId != req.user.id) {
			throw Error('You are not authorized to perform this action.');
		}
		await Offer.updateOne({ _id: req.params.id }, { $set: req.body });
		return 'Offer updated successfully';
	} catch (error) {
		throw Error(error);
	}
};
//delete offer
exports.deleteOffer = async (req) => {
	try {
		/*if (offer.sellerId != req.user.id) {
			throw Error('You are not authorized to perform this action.');
		}*/
		await Offer.updateOne({ _id: req.params.id }, { $set: { offerDeleted: true, offerStatus: 'expired' } });
		await Product.updateOne({ offer:req.params.id }, { $unset: { offer: 1 } , $set : {discount : 0.0} });
		return 'Offer deleted successfully';
	} catch (error) {
		console.log(error);
		throw Error(error);
		
	}
};
