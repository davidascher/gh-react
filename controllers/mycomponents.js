/**
 * GET /mycomponents
 * Page both listing components we know we need and a form for adding new ones
 */

exports.index = function(req, res) {
  res.render('mycomponents', {
    title: 'Your Hosted Components'
  });
};
