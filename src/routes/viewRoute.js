const router = require('express').Router();
var ViewController = require('../controllers/viewController');
const { verifyToken } = require('../middleware/verifyToken');
//get all views 
router.get('/:id', verifyToken,ViewController.getViews );
//get views by store 
router.get('/store/:id',ViewController.getStoreViews );
//get views by product
router.get('/product/:id', verifyToken,ViewController.getProductViews );
//get views by régions 
router.get('/region/:id', verifyToken,ViewController.getRegionViews );
module.exports = router;