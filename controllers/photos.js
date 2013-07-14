var ACS = require('acs').ACS,
    logger = require('acs').logger;

function _create(req, res) {
  console.log(req.files.upload);
  var data = {
    photo: req.files.upload
  };
  ACS.Photos.create(data, function(e) {
    if(e.success && e.success === true){
      // how to handle ckeditor callback, http://zerokspot.com/weblog/2009/09/09/custom-filebrowser-callbacks-ckeditor/
      var o = '<html><body><script type="text/javascript">window.parent.CKEDITOR.tools.callFunction(1,"","Successfully Uploaded. Broswer Server to select uploaded photos.");</script></body></html>';
    }else{
      var o = '<html><body><script type="text/javascript">window.parent.CKEDITOR.tools.callFunction(1,"","'+e.message+'");</script></body></html>';
    }
    res.send(o);
  }, req, res);
}

function uploadBrowser(req, res) {
  ACS.Photos.query({per_page:1000, order:"-updated_at"}, function(e) {
    if(e.success && e.success === true){
      res.render('photos/uploadBrowser', {
        layout: false,
        req: req,
        obj: e
      });
    }else{
      res.send(e);
    }
  }, req, res);
}