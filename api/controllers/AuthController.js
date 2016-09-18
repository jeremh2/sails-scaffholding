/**
 * AuthController
 *
 * @description :: Server-side logic for managing Auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var uuid = require('node-uuid');


module.exports = {

	/**
	 * Log in a User
   *
   * @param {Object} req
   * @param {Object} res
   */
  login: function (req, res) {


		Credential.findOne({user: user.id}).populate('user').exec(function (err, credential) {
			if (err) return res.negotiate(err);

			req.session.authenticated = true

			return res.ok({
				message: "successfully authenticated",
				accessToken: credential.accessToken,
				user: credential.user
			});
		});

  },

  /**
   * Log out a user and return them to the homepage
   *
   *
   * @param {Object} req
   * @param {Object} res
   */
  logout: function (req, res) {

    // mark the user as logged out for auth purposes
    req.session.authenticated = false;

    res.ok({message: "session successfully logged out"});
  },

  /**
   * Render the registration page
   *
   * Just like the login form, the registration form is just simple HTML:
   *
      <form role="form" action="/auth/local/register" method="post">
        <input type="text" name="username" placeholder="Username">
        <input type="text" name="email" placeholder="Email">
        <input type="password" name="password" placeholder="Password">
        <button type="submit">Sign up</button>
      </form>
   *
   * @param {Object} req
   * @param {Object} res
   */
  register: function (req, res) {

    res.view({
      errors: req.flash('error')
    });
  },


  /**
   * Disconnect a passport from a user
   *
   * @param {Object} req
   * @param {Object} res
   */
  disconnect: function (req, res) {
    passport.disconnect(req, res);
  },


  forgot: function (req, res) {
    var email = req.body.email;

    var token = uuid.v4(); // generate a random and unique token

    User.findOne({email: email}).exec(function (err, user) {
      if (err) return res.negociate(err);
      if (!user) return res.badRequest({message: "No account with that email address exists.", code: 1});

      var expires = Date.now() + 3600000; // 1 hour

      Passport.update({user: user.id, protocol: 'local'}, {resetPasswordToken: token, resetPasswordExpires: expires}).exec(function (err, updatedPassports) {
        if (err) return res.negotiate(err);
        if (!updatedPassports[0]) return res.badRequest({message: "This account is authenticated by other means than password.", code: 2});

        // send an email to the user with a link to the reset password page
        userEmails.lostPassword(user, token);
        return res.ok({message: 'An email has been sent to ' + user.email + ' with further instructions.', email: user.email});

      });
    });
  },

  reset: function (req, res) {

    Passport.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}).exec(function (err, passport) {
      if (err) return res.negotiate(err);
      if (!passport) return res.badRequest('Password reset token is invalid or has expired.');

      if (req.method == 'GET') return res.view('auth/reset', {layout: 'rawLayout', context: {}});

      // check if the confirm password is the same than password, and return an error if this is the case
      if (req.body.password != req.body.confirm) {
        return res.view('auth/reset', {
          layout: 'rawLayout',
          context: {
            error: {
              message: 'bad password confirmation',
              type: 'danger',
              code: 1
            }
          }
        });
      }

      Passport.update(passport.id, {password: req.body.password, resetPasswordToken: undefined, resetPasswordExpires: undefined}).exec(function (err, updatedPassports) {
        if (err) return res.negotiate(err);
        if (!updatedPassports[0]) return res.notFound();

        // TODO : login the user using the new modified passport
        userEmails.resetedPassword(updatedPassports[0].user);
        return res.view('auth/reset', {
          layout: 'rawLayout',
          context: {
            success: true
          }
        });
      });
    })
  }

};
