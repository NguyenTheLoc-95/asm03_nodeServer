module.exports=((req,res,next)=>{
    console.log(req.session)
    if(req.session.isLoggedIn){
        res.status(500).json({message: "You need to login"})
        return
    }
    next()
})