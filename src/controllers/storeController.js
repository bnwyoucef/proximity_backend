var StoreService = require('../services/storeService');

exports.createStore = async (req, res) => {
	try {
		const store = await StoreService.createStore(req);
		return res.status(200).json({ status: 200, data: store, message: 'Succesfully Store Created' });
	} catch (err) {
		res.status(500).send(err.message);
	}
};

exports.updateStore = async (req, res) => {
	try {
		const store = await StoreService.updateStore(req);
		res.send(store);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.updateStoreRating = async (req, res) => {
	try {
		const store = await StoreService.updateStoreRating(req);
		res.send(store);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.getStore = async (req, res) => {
	try {
		const store = await StoreService.getStore(req);
		res.send(store);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

exports.getStoresByCity = async (req, res) => {
	try {
		const stores = await StoreService.getStoresByCity(req);
		res.send(stores);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
//get seller stores
exports.getSellerStores = async (req, res) => {
	try {
		const stores = await StoreService.getSellerStores(req);
		res.send(stores);
	} catch (err) {
		res.status(500).send(err.message);
	}
};


//get seller store
exports.getSellerStore = async (req, res) => {
	try {
		const stores = await StoreService.getSellerStore(req);
		res.send(stores);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
//get store cats & rayons
exports.getSellerCategoriesAndRayons = async (req, res) => {
	try {
		const stores = await StoreService.getSellerCategoriesAndRayons(req);
		res.send(stores);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.getStoresByLocation = async (req, res) => {
	try {
		const stores = await StoreService.getStoresByLocation(req);
		res.send(stores);
	} catch (err) {
		res.status(500).send(err.message);
	}
};


exports.deleteStore = async (req, res) => {
	try {
		const stores = await StoreService.deleteStore(req);
		res.send(stores);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
// Stats get seller stores income 
exports.getSellerStoresIncome = async (req, res) => {
	try {
		const stores = await StoreService.getSellerStoresIncome(req);
		res.send(stores);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
// ibrahim : controller for get all the stores 
exports.getAllStores = async (req, res) => {
    try {
        const stores = await StoreService.getAllStores();
        res.json(stores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// ibrahim  : get stores by city 
exports.getAllStoresByCity = async (req, res, next) => {
    const city = req.params.city; // Retrieve city from request parameter 'city'
    try {
        const stores = await StoreService.getAllStoresInCity(city);
        res.json(stores);
    } catch (error) {
        console.error("Error fetching stores by city:", error);
        res.status(500).json({ error: "Could not retrieve stores" });
    }
};
// ibrahim : get store by category 
exports.getStoresByCategory = async (req, res, next) => {


    const categoryId = req.params.categoryId;
    try {
        const stores = await StoreService.getStoresByCategory(categoryId);
        res.json(stores);
    } catch (error) {
        console.error("Error fetching stores by category:", error);
        res.status(500).json({ error: "Could not retrieve stores" });
    }
}
// ibrahim : get store of one seller 
exports.getStoresOfSeller = async (req, res, next) => {

	try {
	  const sellerId = req.params.sellerId;
	  const stores = await StoreService.getStoresOfSeller(sellerId);
	  res.json(stores);
	} catch (error) {
	  next(error);
	}
  }
  
  
// ibrahim : get the most active store 
exports.getMostActiveStores = async (req, res, ) => {

  try {
    const mostActiveStores = await StoreService.getMostActiveStores();
    res.json(mostActiveStores);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch most active stores' });
  }
}





