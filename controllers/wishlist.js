/**
 * GET /wishlist
 * Page both listing components we know we need and a form for adding new ones
 */
var Component = require('../models/Component');
// var api = require('api');

exports.index = function(req, res) {
  Component.find({}).sort({"name":1}).exec(function (err, components) {
    if (err){
      console.log('Unable to retrieve components');
      return res.json(500, 'Unable to retrieve components: ' + err);
    }
    res.locals.components = components;
    res.render('wishlist', {
      title: 'Component Wishlist'
    });
  });
};


// exports.index = function(req, res) {
//   var accessToken = req.user.tokens[0].accessToken;
//   // api.getWishlist(
//   Component.find({}).sort({"name":1}).exec(function (err, components) {
//     if (err){
//       console.log('Unable to retrieve components');
//       return res.json(500, 'Unable to retrieve components: ' + err);
//     }
//     res.locals.components = components;
//     res.render('wishlist', {
//       title: 'Component Wishlist'
//     });
//   });
// };

