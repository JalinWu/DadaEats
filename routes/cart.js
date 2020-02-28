const express = require('express');
const router = express.Router();
const path = require('path');
const Order = require('../models/Order');
const fs = require('fs');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// getOrder
router.get('/getCartList', (req, res) => {
    Order.find({expired: false})
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
router.post('/deleteCartList', (req, res) => {
    console.log(req.body);
    
    Order.deleteOne(req.body)
    .then(result => {

    })
})

// updateOrder
router.post('/updateCartList', (req, res) => {
    console.log(req.body);
    const { account } = req.body;
    
    Order.updateMany({"account": account}, {"$set":{"status":"confirmed"}})
    .then(result => {

    })

})

module.exports = router;