const router = require('express').Router();
var StoreController = require('../controllers/storeController');
const { verifyToken, verifySeller, verifyTokenAndAutherization } = require('../middleware/verifyToken');

const { schemaStoreValidation, schemaUpdateStoreValidation, schemaUpdateStoreRatingValidation } = require('../middleware/dataValidation');
//////

router.post('/createStore', verifyToken, schemaStoreValidation, StoreController.createStore);

router.put(
    '/:id', verifySeller,
    schemaUpdateStoreValidation,
    StoreController.updateStore
);
router.get('/seller/:id', verifyToken, StoreController.getSellerStores);
router.get('/seller/store/:id', verifyToken, StoreController.getSellerStore);
router.get('/seller/store/catRayons/:id', verifyToken, StoreController.getSellerCategoriesAndRayons);


router.get('/:id', StoreController.getStore);
router.get('/findStore/:city', verifyToken, StoreController.getStoresByCity);
router.get('/findStore/:latitude/:longitude/:maxDistance', verifyToken, StoreController.getStoresByLocation);
//router.get('find/', verifyToken, StoreController.getStoresByName);


router.post('/update_rating/:id', verifyToken, schemaUpdateStoreRatingValidation, StoreController.updateStoreRating);

router.delete('/:storeId', verifyToken, StoreController.deleteStore);
// Statistics
router.get('/seller/:id/storesIncome', verifyToken, StoreController.getSellerStoresIncome);
//  ibrahim : route to get all the stores 
router.get('/', StoreController.getAllStores);

// ibrahim : get  the store by city 
router.get('/storesInCity/:city', StoreController.getAllStoresByCity);

// ibrahim : get store by store cetegory 
router.get('/category/:categoryId', StoreController.getStoresByCategory);

// ibrahim : get the stores of one seller 
router.get('/stores/:sellerId', StoreController.getStoresOfSeller);
// ibrahim :  get the most active strores 
router.get('/store/MostActive', StoreController.getMostActiveStores);


module.exports = router;
