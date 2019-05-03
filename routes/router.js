var express = require('express');
var router = express.Router();
var User = require('../models/user');



//POST route for updating data
router.post('/', function(req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {//register

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    }

    User.create(userData, function(error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        // return res.redirect('/profile');
        res.json({
          msg:'register success'
        })
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {//login
    User.authenticate(req.body.logemail, req.body.logpassword, function(error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        res.json({userId:req.session.userId})
        // return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})


// GET route after registering
router.post('/successLog', function(req, res, next) {
  User.findById(req.session.userId)
    .exec(function(error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          res.json({
            msg:'please log in'
          })
        } else {
          res.json({
            leftRatio:0.1,
            a:50,
            user:user
          })
        }
      }
    });
});




// GET route after registering
// router.get('/profile', function(req, res, next) {
//   User.findById(req.session.userId)
//     .exec(function(error, user) {
//       if (error) {
//         return next(error);
//       } else {
//         if (user === null) {
//           var err = new Error('Not authorized! Go back!');
//           err.status = 400;
//           return next(err);
//         } else {
//           return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
//         }
//       }
//     });
// });

// GET for logout logout
router.post('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        // return res.redirect('/');
        res.json({
          msg:'log out'
        })
      }
    });
  }
});

module.exports = router;