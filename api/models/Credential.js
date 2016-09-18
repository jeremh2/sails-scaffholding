/**
 * Credential.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var bcrypt = require('bcrypt');

 /**
  * Hash a passport password.
  *
  * @param {Object}   password
  * @param {Function} next
  */
function hashPassword (password, next) {
  bcrypt.hash(password, 10, function (err, hash) {
    var encryptedPassword = hash;
    next(err, encryptedPassword);
  });
}



module.exports = {

  attributes: {

    user: {
      model: 'User',
      required: true
    },

    identifier: {
      type: 'string'
    },

    password: {
      type: 'string',
      minLength: 8
    },

    accessToken: {
      type: 'string',
      unique: true
    },


    /**
     * Validate password used by the local strategy.
     *
     * @param {string}   password The password to validate
     * @param {Function} next
     */
    validatePassword: function (password, next) {
      bcrypt.compare(password, this.password, next);
    }

  },

  /**
   * Callback to be run before creating a Passport.
   *
   * @param {Object}   passport The soon-to-be-created Passport
   * @param {Function} next
   */
  beforeCreate: function (passport, next) {
    hashPassword(passport, next);
  },

  /**
   * Callback to be run before updating a Passport.
   *
   * @param {Object}   passport Values to be updated
   * @param {Function} next
   */
  beforeUpdate: function (passport, next) {
    hashPassword(passport, next);
  }
  
};
