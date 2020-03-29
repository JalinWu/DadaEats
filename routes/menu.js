const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const fs = require('fs');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// getMenu
router.get('/getMenu', ensureAuthenticated, (req, res) => {
    const { name, account } = req.user;
    const orderId = req.query.orderId;

    // 建一筆訂單
    Order.findOne({ account, orderId })
        .then((resultOrder) => {

            // getFreight
            fs.readFile('menus/freight.txt', (err, data) => {
                if (err) throw err;

                var freight = data.toString();

                User.findOne({ account })
                    .then((resultUser) => {
                        var dadaCoin = resultUser.dadaCoin;

                        if (!resultOrder) {
                            var newOrder = new Order({
                                name,
                                account,
                                orderId,
                                order: [],
                                freight,
                                dadaCoin
                            })
                            newOrder.save()
                        }
                    })
            })
        })

    // 取得菜單內容
    fs.readFile('menus/menu.txt', (err, data) => {
        if (err) throw err;

        menus = JSON.parse(data.toString())[0]

        res.render('menu', {
            menus
        })
    })
});

// getToppings
router.get('/getToppings', (req, res) => {
    fs.readFile('menus/toppings.txt', (err, data) => {
        if (err) throw err;

        toppings = JSON.parse(data.toString())

        res.send(toppings)
    })
});

// postOrder
router.post('/postOrder', ensureAuthenticated, (req, res) => {
    console.log('postOrder');
    const { account } = req.user;
    const { orderImg, orderTitle, orderContents, amount } = req.body;

    var subTotal = 0;
    var freight = 0;
    var dadaCoin = 0;
    Order.findOne({ account, orderId })
    .then((result) => {
        for(var i = 0; i < result.orders.length; i++) {
            subTotal += parseInt(result.orders[i].amount);
        }
        freight = result.freight;
        dadaCoin = result.dadaCoin;
    })
    .then((result) => {
        subTotal += parseInt(amount);
        var sum = parseInt(subTotal) + parseInt(freight) - Math.floor(parseInt(dadaCoin)/100)
        Order.updateOne({ account, orderId }, {
            $push: {
                orders: {
                    oid: new Date().getTime().toString(),
                    orderImg,
                    orderTitle,
                    orderContents,
                    amount,
                    status: 'not-confirmed'
                }
            },
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

router.get('/', (req, res) => {
    res.render('menu')
});

module.exports = router;