const express = require('express')
const productController = require('../controller/product')


const route = express.Router()
route.get('/getProduct', productController.getProducts)
route.get('/:id', productController.getDetail),
route.post('/add', productController.addProduct),
route.post('/edit', productController.editProduct),
route.post('/delete', productController.postDeleteProduct),



module.exports =route;