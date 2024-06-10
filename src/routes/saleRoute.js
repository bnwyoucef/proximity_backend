// routes/saleRoutes.js
// ibrahim : i have  create this file 
const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

// router.post('/create', saleController.createSale);


// ibrahim : get the most buy product by region 
router.get('/MostBoughtProductsByRegion', saleController.getMostBoughtProductByRegion);

router.get('/MostBoughtProductInPeriod', saleController.getMostBoughtProductInPeriod);
// routes/saleRoutes.js

router.get('/MostSoldProductsByCategory', saleController.getMostSoldProductsByCategory);

router.get('/sales-count-by-region', saleController.getSalesCountByRegion);



 
module.exports = router;
