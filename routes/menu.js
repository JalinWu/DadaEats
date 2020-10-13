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
    let ordersRefforIndexOn = await database.ref("orders").orderByChild("_id").equalTo("").once('value');

    // 建一筆訂單
    let ordersRef = await database.ref("orders").orderByChild("groupId").equalTo(groupId).once('value');
    let ordersDocs = ordersRef.val();
    console.log(ordersDocs);
    let resultOrderKey = null;
    let resultOrder = null;
    if (ordersDocs) {
        for (let i in ordersDocs) {
            if (ordersDocs[i].account == account) {
                resultOrderKey = i;
                resultOrder = ordersDocs[i];
            }
        }
    }

    if (!resultOrder) {
        // getFreight
        let groupsRef = await database.ref("groups").orderByChild("status").equalTo("open").once('value');
        let groupsDocs = groupsRef.val();
        let freight = 0;
        for (let i in groupsDocs) {
            freight = groupsDocs[i].freight;
        }

        let usersRef = await database.ref("users").orderByChild("account").equalTo(account).once('value');
        let usersDocs = usersRef.val();
        for (let i in usersDocs) {
            var value = usersDocs[i];
            var dadaCoin = value.dadaCoin;

            var newOrder = {
                _id: account + "_" + groupId,
                name,
                account,
                groupId,
                order: [],
                freight,
                dadaCoin
            }
            
            // ordersDocs[resultOrderKey] = newOrder;
            database.ref("orders").push(newOrder);

        }

    }

    // Order.findOne({ account, groupId })
    //     .then(async (resultOrder) => {

    //         //getFreight
    //         var getGroup = await Group.findOne({ status: 'open' });
    //         freight = getGroup.freight;

    //         let usersRef = await database.ref("users").orderByChild("account").equalTo(account).once('value');
    //         let usersDocs = usersRef.val();
    //         for (let i in usersDocs) {
    //             var value = usersDocs[i];
    //             var dadaCoin = value.dadaCoin;

    //             if (!resultOrder) {
    //                 var newOrder = new Order({
    //                     name,
    //                     account,
    //                     groupId,
    //                     order: [],
    //                     freight,
    //                     dadaCoin
    //                 })
    //                 newOrder.save()
    //             }
    //         }

    // User.findOne({ account })
    //     .then((resultUser) => {
    //         var dadaCoin = resultUser.dadaCoin;

    //         if (!resultOrder) {
    //             var newOrder = new Order({
    //                 name,
    //                 account,
    //                 groupId,
    //                 order: [],
    //                 freight,
    //                 dadaCoin
    //             })
    //             newOrder.save()
    //         }
    //     })
    // })

    // var getGroup = await Group.findOne({ status: 'open' }); // 改用爬蟲
    // var title = getGroup.shopName; // 改用爬蟲
    // var imgSrc = getGroup.imgSrc; // 改用爬蟲

    // 取得菜單內容
    fs.readFile('menus/menu.txt', (err, data) => {
        if (err) throw err;

        menus = JSON.parse(data.toString())[0]

        res.render('menu', {
            menus
            // title,
            // imgSrc
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
router.post('/postOrder', ensureAuthenticated, async (req, res) => {
    console.log('postOrder');
    const { account } = req.user;
    var { orderImg, orderTitle, orderContents, amount, groupId } = req.body;
    if (!orderImg) orderImg = "";
    if (!orderTitle) orderTitle = "";
    if (!orderContents) orderContents = [];
    if (!amount) amount = 0;

    var subTotal = 0;
    var freight = 0;
    var dadaCoin = 0;

    let ordersRef = await database.ref("orders").orderByChild("groupId").equalTo(groupId).once('value');
    let ordersDocs = ordersRef.val();
    if (ordersDocs) {
        for (let i in ordersDocs) {
            if (ordersDocs[i].account == account) {
                if(ordersDocs[i].orders) {
                    for (let j = 0; j < ordersDocs[i].orders.length; j++) {
                        subTotal += parseInt(ordersDocs[i].orders[j].amount);
                    }
                }else {
                    ordersDocs[i].orders = new Array();
                }
                freight = ordersDocs[i].freight;
                dadaCoin = ordersDocs[i].dadaCoin;

                subTotal += parseInt(amount);
                var sum = parseInt(subTotal) + parseInt(freight) - Math.floor(parseInt(dadaCoin) / 100)
                ordersDocs[i].orders.push({
                    oid: new Date().getTime().toString(),
                    orderImg,
                    orderTitle,
                    orderContents,
                    amount,
                    status: 'not-confirmed'
                });
                ordersDocs[i].subTotal = subTotal;
                ordersDocs[i].sum = sum;
                database.ref("orders").set(ordersDocs);

                res.send({
                    msg: 'success'
                })
            }
        }


    }

    // Order.findOne({ account, groupId })
    //     .then((result) => {
    //         for (var i = 0; i < result.orders.length; i++) {
    //             subTotal += parseInt(result.orders[i].amount);
    //         }
    //         freight = result.freight;
    //         dadaCoin = result.dadaCoin;
    //     })
    //     .then((result) => {
    //         subTotal += parseInt(amount);
    //         var sum = parseInt(subTotal) + parseInt(freight) - Math.floor(parseInt(dadaCoin) / 100)
    //         Order.updateOne({ account, groupId }, {
    //             $push: {
    //                 orders: {
    //                     oid: new Date().getTime().toString(),
    //                     orderImg,
    //                     orderTitle,
    //                     orderContents,
    //                     amount,
    //                     status: 'not-confirmed'
    //                 }
    //             },
    //             $set: {
    //                 subTotal,
    //                 sum
    //             }
    //         }).then((result) => {
    //             res.send({
    //                 msg: 'success'
    //             })
    //         })
    //     })

})

router.get('/', (req, res) => {
    res.render('menu')
});

module.exports = router;