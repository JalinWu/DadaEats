const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const fs = require('fs');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// getUser
router.get('/getUsers', ensureAuthenticated, (req, res) => {

    User.find({})
        .then(result => {
            // console.log(result);
            res.render('getUsers', {
                permission: req.user.account,
                result
            })

        })
});

// updateDadaCoin
router.post('/updateDadaCoin', ensureAuthenticated, (req, res) => {
    const { dadaCoin, accounts } = req.body;

    for (var i = 0; i < accounts.length; i++) {
        User.findOneAndUpdate({ account: accounts[i].split('user-picker-')[1] }, { $inc: { 'dadaCoin': parseInt(dadaCoin) } }, (err, response) => {
            if (err) throw err;

        })
    }
    res.send('success')
});

// getOrders
router.get('/getOrders', ensureAuthenticated, (req, res) => {
    Order.find({ expired: false })
        .then(result => {
            res.render('getOrders', {
                permission: req.user.account,
                result
            })
        })
})

// updateOrders
router.post('/updateOrders', ensureAuthenticated, (req, res) => {
    const { orderId } = req.body;

    for (var i = 0; i < orderId.length; i++) {
        Order.findOneAndUpdate({ _id: orderId[i].split('user-picker-')[1] }, { $set: { 'expired': true } }, (err, response) => {
            if (err) throw err;

        })
    }
    res.send('success')
});

// updateOrdersPayment
router.post('/updateOrdersPayment', ensureAuthenticated, (req, res) => {
    const { orderId } = req.body;

    Order.findOneAndUpdate({ _id: orderId }, { $set: { 'payment': true } }, (err, response) => {
        if (err) throw err;

    })
    res.send('success')
});

// deleteOrder
// router.post('/deleteCartList', ensureAuthenticated, (req, res) => {

//     Order.deleteOne(req.body)
//     .then(result => {

//     })
// })

// updateOrder
// router.get('/updateCartList', ensureAuthenticated, (req, res) => {

//     Order.updateMany({"account": req.user.account }, {"$set":{"status":"confirmed"}})
//     .then(result => {

//     })

// })

module.exports = router;