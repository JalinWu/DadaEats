const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const fs = require('fs');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// getCartList
router.get('/getCartList/', ensureAuthenticated, (req, res) => {
    const { account } = req.user

    Order.findOne({ expired: false, account })
        .then(result => {

            res.render('cart', {
                result,
            })

        })
});
  
// deleteOrder
router.post('/deleteCartList', ensureAuthenticated, (req, res) => {
    const { account } = req.user;
    console.log(`"${req.body.id}"`);
    console.log(orderId);

    Order.updateOne({ account, orderId }, {
        $pull: {
            "orders": {
                "oid": req.body.id
            }
        }
    }).then((result0) => {
        var subTotal = 0;
        var freight = 0;
        var dadaCoin = 0;
        Order.findOne({ account, orderId })
            .then((result) => {
                for (var i = 0; i < result.orders.length; i++) {
                    subTotal += parseInt(result.orders[i].amount);
                }
                freight = result.freight;
                dadaCoin = result.dadaCoin;
            })
            .then((result) => {
                var sum = parseInt(subTotal) + parseInt(freight) - Math.floor(parseInt(dadaCoin) / 100)
                dadaCoin %= 100;
                Order.updateOne({ account, orderId }, {
                    $set: {
                        subTotal,
                        sum
                    }
                }).then((result) => {
                    res.send({
                        msg: 'success'
                    })
                })
            })
    })
})

// updateOrder
router.get('/updateCartList', ensureAuthenticated, (req, res) => {

    Order.update({ "account": req.user.account }, { "$set": { "orders.$[].status": "confirmed" } })
        .then(result => {

        })

})

module.exports = router;