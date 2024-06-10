// services/saleService.js
// ibrahim : i had create this file 
const Sale = require('../models/Sale');


// ibrahim :  creat a sale to for test 
// async function addSale(saleData) {
//   try {
//     const sale = new Sale(saleData);
//     await sale.save();
//     return sale;
//   } catch (error) {
//     throw new Error(`Error adding sale: ${error.message}`);
//   }
// }

// module.exports = {
//   addSale,
// };

// ibrahim ; get the most buy product by region 
exports.getMostBoughtProductByRegion = async () => {
  try {
    const mostBoughtProductsByRegion = await Sale.aggregate([
      {
        $group: {
          _id: { region: '$region', productId: '$productId' },
          totalQuantity: { $sum: 1 }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $group: {
          _id: '$_id.region',
          mostBoughtProduct: {
            $first: { productId: '$_id.productId', totalQuantity: '$totalQuantity' }
          }
        }
      },
      {
        $sort: { 'mostBoughtProduct.totalQuantity': -1 } // Sort by totalQuantity in descending order
      },
      {
        $lookup: {
          from: 'products', // Assuming your products collection is named 'products'
          localField: 'mostBoughtProduct.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      },
      {
        $project: {
          region: '$_id',
          mostBoughtProduct: 1,
          'productDetails._id': 1,
          'productDetails.name': 1,
          'productDetails.price': 1,
          'productDetails.description': 1,
          'productDetails.category': 1,
          'productDetails.imageUrl': 1
        }
      }
    ]);

    return mostBoughtProductsByRegion;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};



// ibrahim : most buy product in periode  
exports.getMostBoughtProductInPeriod = async (startDate, endDate) => {

  try {
    const mostBoughtProductInPeriod = await Sale.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$productId',
          totalQuantity: { $sum: 1 }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 1
      }
    ]);

    return mostBoughtProductInPeriod;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
// ibrahim : get the most buy product in category 

exports.getMostSoldProductsByCategory = async (categoryId) => {

  try {
    const mostSoldProductsByCategory = await Sale.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $match: {
          'product.categoryId': categoryId
        }
      },
      {
        $group: {
          _id: '$product._id',
          productName: { $first: '$product.name' },
          totalQuantity: { $sum: 1 }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      }
    ]);

    return mostSoldProductsByCategory;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
// ibrahim : this is to ipmliment thze regio (zone geograpgique )...
exports.getSalesCountByRegion = async () => {

  try {
    const salesCount = await Sale.aggregate([
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 }
        }
      }
    ]);
    return salesCount;
  } catch (error) {
    throw new Error('Error fetching sales count by region: ' + error.message);
  }
};








