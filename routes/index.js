var $ = require('jquery');

exports.page = function(req, res) {
  res.render('index', { layout: 'layout', title: 'Flight Grid' });
};

exports.flights = function(req, res) {
  var data = "i=" + req.query["data"] + "&revision=1.25";
  $.ajax({
    type: "POST",
    url: "http://www.hipmunk.com/api/results",
    data: data,
    success: function(data) {
      res.contentType('json');
      res.send(data);
    },
    error: function(error, message) {
      res.contentType('json');
      res.send("error");
    }
  });
};