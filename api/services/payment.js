
/**
 *  payment service
 *  Contain configuration and functions usable in controllers
 */


 //
 // ### Scaffholding instructions ###
 // 1 - Set the api key of the payment processor - line 17 - 18
 //



 // Set your secret key: remember to change this to your live secret key in production
 // See your keys here https://dashboard.stripe.com/account/apikeys
 var stripe = require("stripe")("sk_live_");
 // var stripe = require("stripe")("sk_test_");


module.exports = {

  subscribeCustomer: function (stripeToken, plan, customerEmail, cb) {

    // Charge the customer credit card using the stripe token
    stripe.customers.create({
      source: stripeToken,
      plan: plan,
      email: customerEmail,
    }, function(err, customer) {
      if (err) return cb("Unable to validate the payment");

        return cb(null, customer);

    });

  },

  subscriptionRenewed: function(invoice) {

    if (!invoice.paid) sails.log.error("the invoice has not been paid");

    // Update the user active_until attribute
    User.findOne({stripeId: invoice.customer}).exec(function (err, user){
      if (err) return sails.log.error(err);
      if (!user) return sails.log.error("No user found with stripeId " + stripeId);
      var inOneMonth = new Date(Date.now() + 31*24*3600*1000);
      user.active_until = inOneMonth;
      user.save();

    });
  },

  processWehook: function(data, cb) {
    var that = this;

    stripe.events.retrieve(data.id, function(err, event) {
      if (err) return cb(err);
      if (!event) return cb("error");

      // TODO : this function should be idempotent because it may occasionally be triggered more than once

      switch (event.type) {
        case "invoice.created":
          break;

        case "charge.succeeded":
          break;

        case "invoice.payment_succeeded":
          // renew the subscription by sending the invoice object
          that.subscriptionRenewed(event.data.object);
          break;

        case "invoice.payment_failed":
          break;

        default:
          break;
      }

      return cb(null, "Ok");
    });
  }


};
