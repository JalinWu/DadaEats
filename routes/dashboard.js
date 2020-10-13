const express = require('express');
const router = express.Router();
var request = require("request");
var cheerio = require("cheerio");
var fs = require('fs')
const User = require('../models/User');
const Order = require('../models/Order');
const Group = require('../models/Group');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// getUser
router.get('/getUsers', ensureAuthenticated, async (req, res) => {
    let usersRef = await database.ref("users").once('value');
    let usersDocs = usersRef.val();

    let result = new Array();
    for (let i in usersDocs) {
        let value = usersDocs[i];
        result.push(value);
    }

    res.render('getUsers', {
        permission: req.user.account,
        result
    })

    // User.find({})
    //     .then(result => {
    //         // console.log(result);
    //         res.render('getUsers', {
    //             permission: req.user.account,
    //             result
    //         })
    //     })
});

// updateDadaCoin
router.post('/updateDadaCoin', ensureAuthenticated, async (req, res) => {
    const { dadaCoin, accounts } = req.body;

    for (let i = 0; i < accounts.length; i++) {
        let account = accounts[i].split('user-picker-')[1];
        let usersRef = await database.ref("users").orderByChild("account").equalTo(account).once('value');
        let usersDocs = usersRef.val();
        let oldDadaCoin = 0;
        for (let j in usersDocs) {
            oldDadaCoin = usersDocs[j].dadaCoin;
            usersDocs[j].dadaCoin = oldDadaCoin + parseInt(dadaCoin);
            database.ref("users").set(usersDocs);
        }

        // User.findOneAndUpdate({ account: accounts[i].split('user-picker-')[1] }, { $inc: { 'dadaCoin': parseInt(dadaCoin) } }, (err, response) => {
        //     if (err) throw err;
        // })
    }
    res.send('success')
});
// --------------------------------------------------
// getOrders
router.get('/getOrders', ensureAuthenticated, async (req, res) => {
    let ordersRef = await database.ref("orders").orderByChild("expired").equalTo(false).once('value');
    let ordersDocs = ordersRef.val();
    let orders = new Array();
    for (let i in ordersDocs) {
        orders.push(ordersDocs[i]);
    }
    res.render('getOrders', {
        permission: req.user.account,
        result: orders
    });

    // Order.find({ expired: false })
    //     .then(result => {
    //         res.render('getOrders', {
    //             permission: req.user.account,
    //             result
    //         })
    //     })
})

// updateOrders
router.post('/updateOrders', ensureAuthenticated, async (req, res) => {
    const { orderId } = req.body;

    for (var i = 0; i < orderId.length; i++) {
        let ordersRef = await database.ref("orders").orderByChild("_id").equalTo(orderId[i].split('user-picker-')[1]).once('value');
        let ordersDocs = ordersRef.val();
        console.log(ordersDocs);
        if (ordersDocs) {
            for (let i in ordersDocs) {
                ordersDocs[i].expired = true;
                database.ref("orders").set(ordersDocs);
            }
        }

        // Order.findOneAndUpdate({ _id: orderId[i].split('user-picker-')[1] }, { $set: { 'expired': true } }, (err, response) => {
        //     if (err) throw err;
        // })
    }
    res.send('success')
});

// updateOrdersPayment
router.post('/updateOrdersPayment', ensureAuthenticated, async (req, res) => {
    const { orderId } = req.body;

    let ordersRef = await database.ref("orders").orderByChild("_id").equalTo(orderId).once('value');
    let ordersDocs = ordersRef.val();
    console.log(ordersDocs);
    if (ordersDocs) {
        for (let i in ordersDocs) {
            ordersDocs[i].payment = true;
            database.ref("orders").set(ordersDocs);
        }
    }

    // Order.findOneAndUpdate({ _id: orderId }, { $set: { 'payment': true } }, (err, response) => {
    //     if (err) throw err;
    // })
    res.send('success')
});
// --------------------------------------------------
// getMenus
router.get('/getMenus', ensureAuthenticated, (req, res) => {

    res.render('getMenus', {})
});

function writeIntoJSON(fileName, content) {
    fs.writeFile(fileName, JSON.stringify(content), (err) => {
        if (err) throw err
        // return
    })

}

// createMenus
router.post('/createMenus', ensureAuthenticated, async (req, res) => {
    // var { groupId, foodpandaUrl, shopName, freight, imgSrc, dataVendor } = req.body;  // Archived
    var { groupId, foodpandaUrl, freight } = req.body;

    // close old group
    let groupsRef = await database.ref("groups").orderByChild("status").equalTo("open").once('value');
    let groupsDocs = groupsRef.val();
    console.log(groupsDocs);
    if (groupsDocs) {
        for (let i in groupsDocs) {
            groupsDocs[i].status = "closed";
            database.ref("groups").set(groupsDocs);
        }
    }

    // insert new group
    let groupInfo = {
        groupId,
        foodpandaUrl,
        freight,
        status: "open"
    }
    database.ref("groups").push(groupInfo);


    // close old group
    // var updateGroup = await Group.updateMany({ status: 'open' }, { $set: { status: 'closed' } })

    // insert new group
    // var groupInfo = new Group({
    //     groupId,
    //     foodpandaUrl,
    //     freight
    // })
    // groupInfo.save();

    res.send('success');

});

module.exports = router;