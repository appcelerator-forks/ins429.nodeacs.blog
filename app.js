var ACS = require('acs').ACS,
		express = require('express'),
		partials = require('express-partials');

function start(app) {
	ACS.init('4OiT0CIKFeO90Ug782MZ5L3iUJ8FFTKC', 'dY63vo0ZsGRgdyfaTP7W8wJjhbAiLlnf');

	//use connect.session
	app.use(express.cookieParser());
	app.use(express.session({ key: 'node.acs', secret: "my secret" }));

	//set favicon
	app.use(express.favicon(__dirname + '/public/images/favicon.ico'));

	//set to use express-partial for view
	app.use(partials());

	//Request body parsing middleware supporting JSON, urlencoded, and multipart
	app.use(express.bodyParser());

}

// release resources
function stop() {

}