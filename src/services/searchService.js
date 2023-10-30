const Product = require('../models/Product');
const Store = require('../models/Store');
const User = require('../models/User');
//search the nearest stores
exports.searchStore = async (req) => {
    try {
        const stores = await Store.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [parseFloat(req.query.langitude), parseFloat(req.query.latitude)],
                    },
                    key: 'location',
                    distanceField: 'dist.calculated',
    				maxDistance: 200000,
                    spherical: true,
                    includeLocs: 'dist.location',
                },
            },{
                $match: {
                  isActive: true,
                 name: { $regex: req.query.name, $options: 'i' }, 
         
                   
                }
              }
        ]);

        return stores;
    } catch (err) {
        throw err;
    }
};

async function asyncMap(array, asyncFunc) {
	const promises = array.map(asyncFunc);
	return Promise.all(promises);
  }
  
// Example usage
async function myAsyncFunc(element) {
// do some asynchronous operation with item
	if(!element.policy) {
		element.policy = null ;
		let store = await Store.findById(element.storeId) ;
		if(!(store && store.policy)) {
				let seller = await User.findById(element.sellerId) ;
				console.log(seller._id);
				if(seller && seller.policy) {
					element.policy = seller.policy ;
				}else {
					element.policy = null
				}
		}else {
			element.policy = store.policy  ;
		}
	}
	return element ; 
}

  

// search product by nearest store
exports.searchProduct = async (req) => {
	console.log(req.body) ;
	try {
		if (!req.query.page) {
			req.query.page = 1;
		}
		if (!req.query.limit) {
			req.query.limit = 10;
		}


		//console.log([parseFloat(req.query.langitude), parseFloat(req.query.latitude) , parseFloat(req.query.radius) ]);
		//get the nearest stores
		
		const stores = await Store.aggregate([
			{
				$geoNear: {
					near: {
						type: 'Point',
						coordinates: [parseFloat(req.query.langitude), parseFloat(req.query.latitude)],
					},
					key: 'location',
					distanceField: 'dist.calculated',
					maxDistance: 20000000000000000000000000000000000000000000000,
					spherical: true,
				}
			},
			{
				$match: {
				  isActive: true
				}
			  }
		]);
				
		console.log(req.query);
		
		
		
		//get the products by nearest stores
		//search for the products in those stores
		const products = await Product.find({
			storeId: {
				$in: stores.map((store) => store._id)
			} , 
			name: {
				$regex: req.query.name ? req.query.name  : "",
				$options: 'i',
			},
		})
			.skip((req.query.page - 1) * req.query.limit)
			.limit(parseInt(req.query.limit))
			.sort({ createdAt: -1 });

			if (req.query.name !== "" ) {
				
		  
				for (const product of products) {
			
		  
				  product.numberOfSearches += 1;
				  await product.save();
				}
			  }
			
			let new_products = [...products] ; 
			
			
			new_products  = await asyncMap(new_products, myAsyncFunc);
			
			//console.log(new_products);
		return new_products;
	} catch (err) {
		throw err;
	}
};


// ...

exports.searchPromotion = async (req) => {
  try {
    if (!req.query.page) {
      req.query.page = 1;
    }
    if (!req.query.limit) {
      req.query.limit = 10;
    }

    console.log([parseFloat(req.query.langitude), parseFloat(req.query.latitude), parseFloat(req.query.radius)]);
    //get the nearest stores
	const stores = await Store.aggregate([
		{
			$geoNear: {
				near: {
					type: 'Point',
					coordinates: [parseFloat(req.query.langitude), parseFloat(req.query.latitude)],
				},
				key: 'location',
				distanceField: 'dist.calculated',
				maxDistance: 200000000000000000000000000,
				spherical: true,
			}
		},
		{
			$match: {
			  isActive: true
			}
		  }
	]);
	
    const products = await Product.find({
      storeId: {
        $in: stores.map((store) => store._id)
      },
      name: {
        $regex: req.query.name ? req.query.name : "",
        $options: 'i',
      },
    })
      .skip((req.query.page - 1) * req.query.limit)
      .limit(parseInt(req.query.limit))
      .sort({ createdAt: -1 });

    // Calculate the score for each product with discounts
    const promotions = products.map((product) => {

     if (product.discount > 0 ) {
        const score = calculateScore(product);
		console.log("score");
		console.log(score);
        return {
          //productId: product._id,
		  ...product.toObject(),
          score,
         
        };
      }/* else {
       // return product.toObject();
      }*/
    });
	console.log('promotionnns');

    return promotions;
  } catch (err) {
    throw err;
  }
};

// Function to calculate the score based on the given algorithm
function calculateScore(product) {
	const popularityWeight = 1.0;
	const searchWeight = 2.0;
	const ratingWeight = 5.0;
	const discountWeight = 1.0;
  
	const popularityScore = popularityWeight * product.numberOfSales;
	const searchScore = searchWeight * product.numberOfSearches;
	//const productRating = product.averageRating ?? 0.0;
	const storeRating = product.storeId.rating ?? 0.0; // Assuming you have the store reference in the product
	//const ratingScore = ratingWeight * (productRating + storeRating) / 2; // Calculate the average rating between the product and its store
	//const discountScore = discountWeight * calculateDiscountScore(product.discount, product.discountEndDate);
	const discountScore = discountWeight * product.discount;
  
	const score = popularityScore + searchScore + discountScore;
	return score;
  }
  

// Function to calculate the discount score based on the given algorithm
function calculateDiscountScore(discountPercentage, discountEndDate) {
 /* if (!discountEndDate || discountEndDate <= new Date()) {
    return 0.0;
  }*/

  const remainingDays = Math.max(0, Math.min(30, Math.ceil((discountEndDate - new Date()) / (1000 * 60 * 60 * 24))));
 // return discountPercentage * (1 - remainingDays / 30);
}
