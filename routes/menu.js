const express = require('express');
const router = express.Router();
const path = require('path');
const Order = require('../models/Order');
const fs = require('fs');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// getMenu
router.get('/getMenu', ensureAuthenticated, (req, res) => {
    fs.readFile('menus/menu.json', (err, data) => {
        if(err) throw err;

        menus = JSON.parse(data.toString())[0]

        res.render('menu', {
            menus
        })
    })
});

// getToppings
router.get('/getToppings', (req, res) => {
    fs.readFile('menus/toppings.json', (err, data) => {
        if(err) throw err;

        toppings = JSON.parse(data.toString())

        res.send(toppings)
    })
});

// postOrder
router.post('/postOrder', (req, res) => {
    console.log('postOrder');
    const { name, account, orderImg, orderTitle, orderContents, amount } = req.body;
    const newOrder = new Order({ name, account, orderImg, orderTitle, orderContents, amount });

    newOrder.save()
    .then(result => {
        res.send({
            msg: 'success'
        })
    })
    
})

router.get('/', (req, res) =>{
    res.render('menu')
});

module.exports = router;