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

		if (req.method == 'GET') {
			return res.view('login');
		}

		var identifier = req.params.identifier;
		var password = req.params.password;

		Credential.findOne({identifier: identifier}).populate('user').exec(function (err, credential) {
			if (err) return res.negotiate(err);

			credential.validatePassword(password, function(err, result) {
				if (err) return res.badRequest(err);

				if (!result) return res.forbidden("Bad password");
				else {
					req.session.authenticated = true

					return res.ok({
						message: "successfully authenticated",
						accessToken: credential.accessToken,
						user: credential.user
					});
				}

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

		if (req.method == 'GET') return res.view('register');

		var data = req.params;

		Credential.create({identifier: data.email, password: data.password}).exec(function (err, credential) {
			if (err) return res.negotiate(err);
			if (!credential) return res.serverError("Can't create credentials");

			// Here, add the other attribute you want by default in a new User
			User.create({email: data.email, credential: credential.id}).exec(function (err, user) {
				if (err || !user) {
					Credential.destroy(credential.id).exec(function(err, deleted) {
						err = err || "Can't create User";
						return res.serverError(err);
					});
				}

				req.session.authenticated = true

				return res.created({
					message: "user successfully created and authenticated",
					accessToken: credential.accessToken,
					user: user
				});
			});
		});
  },


  forgot: function (req, res) {

		if (req.method == 'GET') return res.view('forgot');

    var email = req.params.email;

    User.findOne({email: email}).exec(function (err, user) {
      if (err) return res.negotiate(err);
      if (!user) return res.badRequest({message: "No account with that email address exists.", code: 1});

			var token = uuid.v4(); // generate a random and unique token
			var expires = Date.now() + 3600000; // 1 hour

      Credential.update({user: user.id}, {resetPasswordToken: token, resetPasswordExpires: expires}).exec(function (err, updatedPassports) {
        if (err) return res.negotiate(err);
        if (!updatedPassports[0]) return res.badRequest({message: "This account is authenticated by other means than password.", code: 2});

        // send an email to the user with a link to the reset password page
				var emailOptions = {
					to: email,
					subject: 'Reset password',
					html: "<a href='" + sails.config.appUrl + '/auth/reset/' + token + "'>Click here to reset your password</a>"
				}
				email.send(emailOptions);

        return res.ok({message: 'An email has been sent to ' + user.email + ' with further instructions.'});

      });
    });
  },

  reset: function (req, res) {

    Credential.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}).exec(function (err, credential) {
      if (err) return res.negotiate(err);
      if (!credential) return res.badRequest('Password reset token is invalid or has expired.');

      if (req.method == 'GET') return res.view('resetPassword');

      // check if the confirm password is the same than password, and return an error if this is the case
      if (req.body.password != req.body.confirm) {
        return res.view('resetPassword');
      }

      Credential.update(credential.id, {password: req.body.password, resetPasswordToken: undefined, resetPasswordExpires: undefined}).exec(function (err, updated) {
        if (err) return res.negotiate(err);
        if (!updated[0]) return res.notFound();

				req.session.authenticated = true;

        userEmails.resetedPassword(updatedPassports[0].user);

				var emailOptions = {
					to: credential.email,
					subject: 'Password reseted',
					html: "Your password has been changed successfully"
				}
				email.send(emailOptions);

        return res.view('resetPassword', {
          context: {
            success: true
          }
        });
      });
    })
  }

};
