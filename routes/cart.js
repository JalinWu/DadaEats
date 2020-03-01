const express = require('express');
const router = express.Router();
const path = require('path');
const Order = require('../models/Order');
const fs = require('fs');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// getOrder
router.get('/getCartList/', ensureAuthenticated, (req, res) => {
    
    Order.find({expired: false, account: req.user.account})
    .then(result => {
        // console.log(result);
        var subtotal = 0;
        for(var i = 0; i < result.length; i ++){
            subtotal = subtotal + result[i].amount;
        }

        fs.readFile('menus/freight.txt', (err, data) => {
            if(err) throw err;
    
            var freight = data.toString()
    
            res.render('cart',{
                result,
                subtotal,
                freight,
                sum: parseInt(subtotal) + parseInt(freight)
            })
        })
        
    })
});

// deleteOrder
router.post('/deleteCartList', ensureAuthenticated, (req, res) => {
    
    Order.deleteOne(req.body)
    .then(result => {

    })
})

// updateOrder
router.get('/updateCartList', ensureAuthenticated, (req, res) => {
    
    Order.updateMany({"account": req.user.account }, {"$set":{"status":"confirmed"}})
    .then(result => {

    })

})

module.exports = router;