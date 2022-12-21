const passport = require('passport');
const bcrypt = require('bcrypt');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

module.exports = function (app, myDataBase) {

  app.route('/').get((req, res) => {
    res.render('index', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true
    });
  });

  app.post('/login',
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/profile');
  });

  app.get('/profile',
    ensureAuthenticated,
    (req, res) => {
      res.render('profile', {
        username: req.user.username
      });
  });

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.route('/register').post((req, res, next) => {
    myDataBase.findOne({ username: req.body.username }, (err, user) => {
      if (err) { next(err); }
      else if (user) { res.redirect('/'); }
      else {
        const hash = bcrypt.hashSync(req.body.password, 12);
        myDataBase.insertOne({
	  username: req.body.username,
	  password: hash
	}, (err, doc) => {
	  if (err) { res.redirect('/'); }
	  else {
	    next(null, doc.ops[0]);
	  }
	});
      }
    });
  },
    passport.authenticate('local', { failureRedirect: '/' }),
      (req, res) => {
        res.redirect('/profile');
      }
  );

  app.get('/auth/github', passport.authenticate('github'));

  app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/'}),
    (req, res) => {
      //res.redirect('/profile');
      req.session.user_id = req.user.id;
      res.redirect('/chat');
  });

  app.get('/chat',
    ensureAuthenticated,
    (req, res) => {
      res.render('chat', {
        user: req.user 
      });
  });

  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
  });

}
