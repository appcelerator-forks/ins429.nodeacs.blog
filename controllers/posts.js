var ACS = require('acs').ACS;

function _index(req, res) {
  res.render('posts/index', {
    layout: 'application',
    req: req
  });
}

function _query(req, res) {
  ACS.Posts.query({page: req.query.page, per_page:10, order:"-updated_at"}, function(e) {
    res.send(e);
  }, req, res);
}

function _show(req, res) {
  var data = {
    post_id: req.params.id
  };
  ACS.Posts.show(data, function(e) {
    res.send(e);
  }, req, res);
}

function _create(req, res) {
  console.log(req.body)
  var data = {
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags
  };
  ACS.Posts.create(data, function(e) {
    res.send(e);
  }, req, res);
}

function _update(req, res) {
  var data = {
    post_id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags
  };
  ACS.Posts.update(data, function(e) {
    res.send(e);
  }, req, res);
}

function _delete(req, res) {
  var data = {
    post_id: req.query.id
  };
  ACS.Posts.remove(data, function(e) {
    res.send(e);
  }, req, res);
}
