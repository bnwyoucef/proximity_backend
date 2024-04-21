// controllers/saleController.js
// ibrahim : i have create this file 
// ibrahim : getMostBoughtProductByRegion
const saleService = require('../services/saleService');


// ibrahim ; get the most buy product by region 

exports.getMostBoughtProductByRegion = async (req, res, next ) => {

  try {
    const mostBoughtProductsByRegion = await saleService.getMostBoughtProductByRegion();
    res.json(mostBoughtProductsByRegion);
  } catch (error) {
    next(error);
  }
}
// ibrahim : most buy product in periode 

exports.getMostBoughtProductInPeriod = async (req, res, next ) => {

  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const mostBoughtProductInPeriod = await saleService.getMostBoughtProductInPeriod(startDate, endDate);
    res.json(mostBoughtProductInPeriod);
  } catch (error) {
    next(error);
  }
}

// ibrahim ; get the mmost buy product by cetegory 
exports.getMostSoldProductsByCategory = async (req, res, next ) => {

  try {
    const categoryId = req.query.categoryId;

    if (!categoryId) {
      return res.status(400).json({ message: 'Category ID is required' });
    }

    const mostSoldProductsByCategory = await saleService.getMostSoldProductsByCategory(categoryId);
    res.json(mostSoldProductsByCategory);
  } catch (error) {
    next(error);
  }
}




