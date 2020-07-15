const express = require('express');
const router = express.Router();
const fs = require('fs');
const Order = require('../models/Order');
const User = require('../models/User');
const Group = require('../models/Group');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// getMenu
router.get('/getMenu', ensureAuthenticated, async (req, res) => {
    const { name, account } = req.user;
    const groupId = req.query.groupId;

    // 建一筆訂單
    Order.findOne({ account, groupId })
        .then(async (resultOrder) => {

            //getFreight
            var getGroup = await Group.findOne({ status: 'open' });
            freight = getGroup.freight;

            User.findOne({ account })
                .then((resultUser) => {
                    var dadaCoin = resultUser.dadaCoin;

                    if (!resultOrder) {
                        var newOrder = new Order({
                            name,
                            account,
                            groupId,
                            order: [],
                            freight,
                            dadaCoin
                        })
                        newOrder.save()
                    }
                })
        })

    var getGroup = await Group.findOne({ status: 'open' });
    var title = getGroup.shopName;
    var imgSrc = getGroup.imgSrc;

    // 取得菜單內容
    fs.readFile('menus/menu.txt', (err, data) => {
        if (err) throw err;

        menus = JSON.parse(data.toString())[0]

        res.render('menu', {
            title,
            menus,
            imgSrc
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
    const { orderImg, orderTitle, orderContents, amount, groupId } = req.body;

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
            subTotal += parseInt(amount);
            var sum = parseInt(subTotal) + parseInt(freight) - Math.floor(parseInt(dadaCoin) / 100)
            Order.updateOne({ account, groupId }, {
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