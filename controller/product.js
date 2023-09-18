const Products = require('../model/product')



exports.getProducts =(req,res,next)=>{
  
    Products.find().then(product=>{
         res.status(200).json(product) 
    })
}
exports.getDetail =(req,res,next)=>{
  const id= req.params.id
     Products.findOne({_id:id}).then(product=>{
       
     if(!product){
        res.status(401).json({message:"not found"}) 
        return
     }
         res.status(200).json(product) 
    }).catch((err)=>{
        console.log(err)
    })
}