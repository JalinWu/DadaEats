const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Group = require('../models/Group');
const fs = require('fs');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// getCartList
router.get('/getCartList/', ensureAuthenticated, (req, res) => {
    const { account } = req.user
    const groupId = req.query.groupId;

    Order.findOne({ expired: false, account, groupId })
        .then(result => {
            console.log(result);
            

            res.render('cart', {
                result,
            })

        })
});
  
// deleteOrder
router.post('/deleteCartList', ensureAuthenticated, async (req, res) => {
    const { account } = req.user;
    console.log(`"${req.body.id}"`);

    var getGroup = await Group.findOne({ status: 'open' })
    var groupId = getGroup.groupId;

    Order.updateOne({ account, groupId }, {
        $pull: {
            "orders": {
                "oid": req.body.id
            }
        }
    }).then((result0) => {
        var subTotal = 0;
        var freight = 0;
        var dadaCoin = 0;
        Order.findOne({ account, groupId })
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
                Order.updateOne({ account, groupId }, {
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

    Order.updateMany({ "account": req.user.account }, { "$set": { "orders.$[].status": "confirmed" } })
        .then(result => {
            res.send({
                msg: 'success'
            })
        })

})

module.exports = router;