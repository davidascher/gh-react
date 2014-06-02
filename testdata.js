var path = require('path');
var mongoose = require('mongoose');
var User = require('./models/User');
var Component = require('./models/Component');
var secrets = require('./config/secrets');

console.log("secrets.db", secrets.db);
mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.log('✗ MongoDB Connection Error. Please make sure MongoDB is running.'.red);
});

var components = [];

components.push({
  name: 'Image Gallery',
  repo: 'testuser/gallery',
  description: 'A gallery for showing images',
  fans: ['testuser']
});
components.push({
  name: 'Facebook',
  repo: 'testuser/facebook',
  description: 'A way to publish to facebook',
  fans: ['testuser']
});
components.push({
  name: 'PagSeguro Brazilian e-commerce',
  repo: 'testuser/bpaga',
  description: 'A way to pay for things using PagSeguro',
  fans: []
});

components.forEach(function(obj) {
  var comp = new Component(obj);
  console.log("saving component", obj.name);
  comp.save(function(err, comp) {
    if (err){
      console.log('Component was not saved due to ' + err);
    }
  });
});
// process.exit();
