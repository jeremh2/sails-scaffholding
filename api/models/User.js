/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {

    firstName: {
      type: 'string'
    },

    lastName: {
      type: 'string'
    },

    email: {
      type: 'email',
      unique: true
    },

    credentials: {
      model: 'Credential',
      via: 'user'
    },

    active_until: {
      type: 'date'
    },

    stripeId: {
      type: 'string'
    }
  }
};
