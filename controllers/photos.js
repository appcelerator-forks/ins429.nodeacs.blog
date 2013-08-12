var ACS = require('acs').ACS,
    logger = require('acs').logger;

function _create(req, res) {
  console.log(req.files.upload);
  var data = {
    photo: req.files.upload
  };
  ACS.Photos.create(data, function(e) {
    res.send(e);
  }, req, res);
}

function _query(req, res) {
  ACS.Photos.query(req.query, function(e) {
    console.log(e)
    res.send(e);
  }, req, res);
}