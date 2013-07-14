function index(req, res) {
	res.render('index', {
    layout: 'application',
    user: req.session.user,
    req: req
  });
}

function login(req, res) {
	res.render('login', {
    layout: 'application',
    req: req
  });
}

function signup(req, res) {
	res.render('signup', {
    layout: 'application',
    req: req
  });
}

function chatroom(req, res) {
	res.render('chatroom', {
    layout: 'application',
    req: req
  });
}