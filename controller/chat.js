const Users = require('../model/user')


exports.getAllRoom = (req, res, next) => {
    Users.find().then((user) => {
     const users = user  
       const filter = users.filter(el=>el.role === "client"
       )
     
      res.status(200).json(filter);
    });
  };