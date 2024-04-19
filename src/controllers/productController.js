var ProductService = require('../services/productService');
const Product = require('../models/Product'); // Adjust the path based on the actual location of your Product model file

exports.updateProduct = async (req, res) => {
	try {
		const product = await ProductService.updateProduct(req);
		res.send(product);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

exports.updateNumberOfViews = async (req, res) => {
	// The new value for numberOfSearches
	console.log('// The new value for numberOfview)');
	// Find the product by ID
	try {
		const product = await ProductService.updateNumberOfViews(req);
		res.send(product);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

exports.updateNumberOfSales = async (req, res) => {
	try {
		const product = await ProductService.updateNumberOfSales(req);
		res.send(product);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

exports.addProduct = async (req, res) => {
	try {
		const product = await ProductService.addProduct(req);

		res.send(product);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.deleteProduct = async (req, res) => {
	try {
		const product = await ProductService.deleteProduct(req);
		res.send(product);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.getProduct = async (req, res) => {
	try {
		const product = await ProductService.getProduct(req);
		res.send(product);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.getProducts = async (req, res) => {
	try {
		const products = await ProductService.getProducts(req);
		res.send(products);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.getProductsLimit = async (req, res) => {
	try {
		const products = await ProductService.getProductsLimit(req);
		res.send(products);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.searchProduct = async (req, res) => {
	try {
		const products = await ProductService.searchProduct(req);
		res.send(products);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.searchProductStore = async (req, res) => {
	try {
		const products = await ProductService.getProducts(req);
		res.send(products);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.getProductSales = async (req, res) => {
	try {
		console.log(req.user.id);
		const products = await ProductService.getProductSales(req);
		res.send(products);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.reportProduct = async (req, res) => {
	try {
		const products = await ProductService.reportProduct(req);
		res.send(products);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
//get all reports for a product
exports.getReports = async (req, res) => {
	try {
		const products = await ProductService.getReports(req);
		res.send(products);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
//get all reported products
exports.getReportedProducts = async (req, res) => {
	try {
		const products = await ProductService.getReportedProducts(req);
		res.send(products);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
// ibirahim : controller to get all the products 
exports.getAllProducts = async (req, res) => {
	try {
		const products = await ProductService.getAllProducts();
		res.json(products);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}
//ibrahim :  get product by category 
exports.searchProductsByCategory = async (req, res) => {

	const categoryId = req.params.categoryId;

	try {
		const products = await ProductService.searchProductsByCategory(categoryId);
		res.json(products);
	} catch (error) {
		res.status(500).json({ message: "Error searching products by category" });
	}
}
// ibrahim : get  product by city 
exports.searchProductsByCity = async (req, res) => {
	const city = req.params.city;
	try {
		const products = await ProductService.searchProductsByCity(city);
		res.json(products);
	} catch (error) {
		res.status(500).json({ message: "Error searching products by city" });
	}
}
// ibrahim : get all the repostrt
// exports.getAllProductsWithReports = async (req, res) => {

// 	try {
// 	  const products = await ProductService.getAllProductsWithReports();
// 	  res.json(products);
// 	} catch (error) {
// 	  res.status(500).json({ error: error.message });
// 	}
//   }
  

  
