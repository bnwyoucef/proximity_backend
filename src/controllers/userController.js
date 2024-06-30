var UserService = require('../services/userService');
exports.updateUser = async (req, res) => {
	try {
		const user = await UserService.updateUser(req);
		res.send(user);
	} catch (err) {
		res.status(500).send(err.message);
	}
};


exports.updateUserImage = async (req, res) => {
	try {
		const user = await UserService.updateUserImage(req);
		res.send(user);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

exports.deleteUser = async (req, res) => {
	try {
		const user = await UserService.deleteUser(req);
		res.send(user);
	} catch (err) {
		res.status(500).send(err.message);
	}
};

exports.getUser = async (req, res) => {
	try {
		const user = await UserService.getUser(req);
		res.send(user);
	} catch (err) {
		res.status(500).send(err.message);
	}
};


exports.welcome = async (req, res) => {
	try {
		const user = await UserService.welcome(req);
		res.send(user);
	} catch (err) {
		res.status(500).send(err.message);
	}
};



exports.getUsers = async (req, res) => {
	try {
		const users = await UserService.getUsers(req);
		res.send(users);
	} catch (err) {
		res.status(500).send(err.message);
	}
};
// ibrahim : get all the sellers 
exports.getSellers = async (req, res) => {

	try {
		const users = await UserService.getSellers('seller');
		res.json(users);
	} catch (error) {
		res.status(500).json({ error: "Internal Server Error" });
	}
}
// ibrahim : get all manager 
exports.getManagers= async (req, res) => {

	try {
		const users = await UserService.getManagers('manager');
		res.json(users);
	} catch (error) {
		res.status(500).json({ error: "Internal Server Error" });
	}
}
// ibrahiml : get seller by id 
exports.getUserById = async (req, res) => {

	try {
		const userId = req.params.userId;
		const user = await UserService.getUserById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(200).json(user);
	} catch (error) {
		console.error('Error fetching user by ID:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

