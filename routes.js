const passport = require('passport');
const bcrypt = require('bcryptjs');

module.exports = function (app, myDataBase) {
  app.route('/').get((req, res) => {
    res.render('index', { 
      title: 'Connected to Database', 
      message: 'Please log in',
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true
    });
  });

  app.route('/chat').get(
    ensureAuthenticated, //ensure is logged in
    (req, res) => {
      res.render('chat', { 
        user: req.user
    });
  });

  app.route('/profile').get(
    ensureAuthenticated, //ensure is logged in
    (req, res) => {
      res.render('profile', {
        username: req.user.username
      });
    }
  );

  app.route('/auth/github').get(passport.authenticate('github'));

  app.route('/auth/github/callback').get(
    passport.authenticate('github', { failureRedirect: '/' }), 
    (req,res) => {
      req.session.user_id = req.user.id;
      res.redirect('/chat');
    }
  );

  app.route('/register').post(async (req, res, next) => {
    try {
      const user = await myDataBase.findOne({ username: req.body.username });
      if (user) return res.redirect('/');
  
      const hash = bcrypt.hashSync(req.body.password, 12);
      const newUser = await myDataBase.insertOne({
        username: req.body.username,
        password: hash,
      });
  
      req.login(newUser.ops[0], (err) => {
        if (err) return next(err);
        res.redirect('/profile');
      });
    } catch (err) {
      next(err);
    }
  });

  app.route('/login').post(
    // to login first
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/profile');
    }
  );

  app.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    }
  );
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};