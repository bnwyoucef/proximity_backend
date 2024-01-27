const { json } = require('express');
var ProductController = require('../controllers/productController');
const { updateProductSchemaValidation, createProductSchemaValidation } = require('../middleware/dataValidation');

const { verifyToken, verifyAdmin, verifySeller } = require('../middleware/verifyToken');

const router = require('express').Router();

router.put('/:id', verifySeller, updateProductSchemaValidation, ProductController.updateProduct);
// update numberOfSales
router.put('/:id/city/numberOfSales', ProductController.updateNumberOfSales);
//update numberSearch
router.put('/:id/numberOfViews', ProductController.updateNumberOfViews);
//update
//Add Product
router.post('/', verifySeller, createProductSchemaValidation, ProductController.addProduct);
//delete Product
router.delete('/:id', verifySeller, ProductController.deleteProduct);
//get Product
router.get('/:id', ProductController.getProduct);
//get all products for a store
router.post('/store/:id', ProductController.searchProductStore);

//statistiques
router.get('/sales/:id', verifySeller, ProductController.getProductSales);
//get limit products for a store

//router.get('/store/:id/limit/:limit', verifyToken, ProductController.getProductsForStoreLimit);
//search product by his name
router.get('/search/:name', verifyToken, ProductController.searchProduct);
//search product by his name and store id
router.get('/search/:name/store/:id', verifyToken, ProductController.searchProductStore);

module.exports = router;
