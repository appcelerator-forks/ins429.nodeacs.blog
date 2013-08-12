function index(req, res) {
	res.render('index', {
    layout: 'application',
    req: req
  });
}
