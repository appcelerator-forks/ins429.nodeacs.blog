var ACS = require('acs').ACS,
  logger = require('acs').logger;

function _query(req, res) {
  req.session.controller = "reviews";
  ACS.Reviews.query({per_page:10, order:"-updated_at"}, function(e) {
    res.send(e);
  }, req, res);
}
