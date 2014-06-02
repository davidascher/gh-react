module.exports = {
  db: process.env.MONGOLAB_URI || process.env.MONGO_URI || 'mongodb://localhost/kitchen2',

  github: {
    clientID: process.env.GITHUB_CLIENTID,
    clientSecret: process.env.GITHUB_CLIENTSECRET,
    callbackURL: '/auth/github/callback',
    passReqToCallback: true
  },
};
