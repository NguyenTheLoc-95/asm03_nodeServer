const express = require('express')
const chatController = require('../controller/chat')


const route = express.Router()
route.get('/getAllRoom', chatController.getAllRoom);





module.exports =route;