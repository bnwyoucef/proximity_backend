var ViewService = require('../services/viewService');
exports.getViews = async (req, res) => {
	try {
		const totalViews= await ViewService.getViews(req);
		res.json({totalViews});
	
	} catch (err) {
		res.status(500).send(err.message);
	}
};


exports.getProductViews = async (req, res) => {
	try {
		const view= await ViewService.getProductViews(req);
		
		res.send(view);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
exports.getStoreViews = async (req, res) => {
    try {
	const view= await ViewService.getStoreViews(req);
		
		res.send(view);
	} catch (err) { 
		res.status(500).send(err.message);
	}
};
exports.getRegionViews = async (req, res) => {
    try {
	const view= await ViewService.getRegionViews(req);
		
		res.send(view);
	} catch (err) { 
		res.status(500).send(err.message);
	}
};