const express = require('express')
const shopController = require('../controller/shop')


const route = express.Router()
route.post('/carts/add', shopController.addToCart);
route.get('/carts', shopController.getCart);
route.delete('/carts/delete', shopController.deleteCart);
route.post('/create-order', shopController.postOrder);
route.get('/orders', shopController.getOrders);
route.get('/histories/:id', shopController.historiesDetail);
route.get('/all-histories', shopController.historiesAll);
route.post('/carts/update', shopController.updateCart);




module.exports =route;