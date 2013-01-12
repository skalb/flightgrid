exports.page = function(req, res) {
  res.render('index', { layout: 'layout', title: 'Flight Grid' });
};