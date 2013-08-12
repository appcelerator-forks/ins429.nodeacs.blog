var ACS = require('acs').ACS;

function login(req, res) {
	var params = {
		login: req.body.login,
		password: req.body.password
	};
	console.log(params);
	ACS.Users.login(params, function(data) {
		res.send(data);
	}, req, res);
}

function logout(req, res) {
	ACS.Users.logout(function(data) {
		res.send(data);
	}, req, res);
}

function signup(req, res) {
	var data = {
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		email: req.body.email,
		username: req.body.username,
		password: req.body.password,
		password_confirmation: req.body.password_confirmation
	};
	console.log(data);
	ACS.Users.create(data, function(e) {
		res.send(e);
	}, req, res);
}

function showMe(req, res) {
	ACS.Users.showMe(function(data) {
		res.send(data);
	}, req, res);
}