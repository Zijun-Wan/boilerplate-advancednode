const passport = require('passport');
const bcrypt = require('bcrypt');
const { ObjectID } = require('mongodb');
const LocalStrategy = require('passport-local');

module.exports = function (app, myDataBase) {
  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
  });

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await myDataBase.findOne({ username: username })
      console.log(`User ${username} attempted to log in.`);
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      console.log(`User ${username} attempted to log in.`);
      return done(err);
    }
  }));

  // stores the user id in session, called only by req.login()
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // gets the complete user, called by every request so req.user has the information
  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      done(null, doc);
    });
  });
}