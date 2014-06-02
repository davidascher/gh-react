var mongoose = require('mongoose');

var componentSchema = new mongoose.Schema({
  name: { type: String },
  repo: { type: String, unique: true },
  description: { type: String, default: '' },
  sampleapps: { type: String, default: '' },
  fans: Array, // Users who have starred it
});

// componentSchema.pre('save', function(next) {
//   var user = this;
//   var SALT_FACTOR = 5;

//   if (!user.isModified('password')) return next();

//   bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
//     if (err) return next(err);

//     bcrypt.hash(user.password, salt, null, function(err, hash) {
//       if (err) return next(err);
//       user.password = hash;
//       next();
//     });
//   });
// });

componentSchema.methods.isFave = function(userid) {
  console.log(component.fans, userid);
  return (userid in component.fans)
};

module.exports = mongoose.model('Component', componentSchema);
