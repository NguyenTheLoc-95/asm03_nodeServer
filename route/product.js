const express = require('express')
const productController = require('../controller/product')


const route = express.Router()
route.get('/getProduct', productController.getProducts)
route.get('/:id', productController.getDetail),


module.exports =route;