const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderList = require('../models/OrderList');
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
    }).then((result) => {
        res.send({
            msg: 'success'
        })
    })
})

// updateOrder
router.get('/updateCartList', ensureAuthenticated, (req, res) => {

    OrderList.updateMany({ "account": req.user.account }, { "$set": { "status": "confirmed" } })
        .then(result => {

        })

})

module.exports = router;