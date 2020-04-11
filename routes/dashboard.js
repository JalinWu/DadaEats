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
// --------------------------------------------------
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
    const { groupId, foodpandaUrl, shopName, freight } = req.body;

    // close old group
    var updateGroup = await Group.updateMany({ status: 'open' }, { $set: { status: 'closed' }})

    // insert new group
    var groupInfo = new Group({
        groupId,
        foodpandaUrl,
        shopName,
        freight
    })
    groupInfo.save();

    // webcrawler
    var r = request(foodpandaUrl, (error, response, body) => {
        if (error) throw error;

        var $ = cheerio.load(body);

        var whereWrapper = $(".where-wrapper");
        var dataVendor = JSON.parse($(whereWrapper[0]).attr('data-vendor'));

        // getLowestPrice
        const JSONdata = dataVendor.menus

        console.log(JSONdata[0].menu_categories[0].products[0].product_variations[0].price)
        var menu_categories = JSONdata[0].menu_categories;

        for (var i = 0; i < menu_categories.length; i++) {
            for (var j = 0; j < menu_categories[i].products.length; j++) {
                var lowestPrice = 100000;
                for (var k = 0; k < menu_categories[i].products[j].product_variations.length; k++) {
                    var currentPrice = menu_categories[i].products[j].product_variations[k].price
                    if (currentPrice < lowestPrice)
                        lowestPrice = currentPrice;
                }
                menu_categories[i].products[j].lowestPrice = lowestPrice;
            }
        }

        JSONdata[0].menu_categories = menu_categories;
        fs.writeFileSync('./menus/menu.txt', JSON.stringify(JSONdata))

        writeIntoJSON('./menus/toppings.txt', dataVendor.toppings)

    })
    res.send('success');

});

module.exports = router;