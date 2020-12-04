const express = require('express');
const router = express.Router();
const fs = require('fs');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// getCartList
router.get('/getCartList/', ensureAuthenticated, async (req, res) => {
    const { account } = req.user
    const groupId = req.query.groupId;

    let ordersRef = await database.ref("orders").orderByChild("expired").equalTo(false).once('value');
    let ordersDocs = ordersRef.val();
    if (ordersDocs) {
        for (let i in ordersDocs) {
            if (ordersDocs[i].account == account && ordersDocs[i].groupId == groupId) {
                let result = ordersDocs[i];
                res.render('cart', {
                    result,
                })
            }
        }
    } else {
        res.render('cart', { result: null })
    }

});

// deleteOrder
router.post('/deleteCartList', ensureAuthenticated, async (req, res) => {
    const { account } = req.user;
    const oid = req.body.id;

    let groupsRef = await database.ref("groups").orderByChild("status").equalTo("open").once('value');
    let groupsDocs = groupsRef.val();
    let groupId = 0;
    for (let i in groupsDocs) {
        groupId = groupsDocs[i].groupId;
    }

    let ordersRef = await database.ref("orders").once('value');
    let ordersDocs = ordersRef.val();
    for (let i in ordersDocs) {
        if (ordersDocs[i].account == account && ordersDocs[i].groupId == groupId) {
            let subTotal = 0;
            let freight = parseInt(ordersDocs[i].freight);
            let dadaCoin = parseInt(ordersDocs[i].dadaCoin);
            let sum = 0;
            let item = null;
            for (let j = 0; j < ordersDocs[i].orders.length; j++) {
                if (ordersDocs[i].orders[j].oid == oid) {
                    item = j;
                } else {
                    subTotal += parseInt(ordersDocs[i].orders[j].amount);
                }
            }
            ordersDocs[i].orders.splice(item, 1);
            sum = subTotal + freight - Math.floor(dadaCoin / 100);
            ordersDocs[i].subTotal = subTotal;
            ordersDocs[i].sum = sum;
            database.ref("orders").set(ordersDocs);
        }
    }

    res.send({
        msg: 'success'
    })
})

// updateOrder
router.get('/updateCartList', ensureAuthenticated, async (req, res) => {
    const { account } = req.user;

    let ordersRef = await database.ref("orders").orderByChild("account").equalTo(account).once('value');
    let ordersDocs = ordersRef.val();
    for (let i in ordersDocs) {
        if (ordersDocs[i].expired == false) {
            for (let j = 0; j < ordersDocs[i].orders.length; j++) {
                ordersDocs[i].orders[j].status = "confirmed";
            }
        }
    }
    database.ref("orders").update(ordersDocs);
    res.send({
        msg: 'success'
    });

})

module.exports = router;