/**
 * Credential.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var bcrypt = require('bcrypt');
var uuid = require('node-uuid');

 /**
  * Hash a passport password.
  *
  * @param {Object}   password
  * @param {Function} next
  */
function hashPassword (password, cb) {
  bcrypt.hash(password, 10, function (err, hash) {
    var encryptedPassword = hash;
    return cb(err, encryptedPassword);
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
   * Callback to be run before creating a Credential.
   *
   * @param {Object}   credential The soon-to-be-created credential
   * @param {Function} next
   */
  beforeCreate: function (credential, next) {
    credential.accessToken = uuid.v4();

    hashPassword(credential.password, function(err, encryptedPassword) {
      credential.password = encryptedPassword;

      return next(err, credential)
    });
  },

  /**
   * Callback to be run before updating a Credential.
   *
   * @param {Object}   credential Values to be updated
   * @param {Function} next
   */
  beforeUpdate: function (credential, next) {
    hashPassword(credential.password, function(err, encryptedPassword) {
      credential.password = encryptedPassword;
      return next(err, credential)
    });
  }

};
