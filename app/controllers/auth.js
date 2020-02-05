const User = require('../models/User')
const passport=require('passport')
const jwt=require('jsonwebtoken')
module.exports = {
  authenticateUser:(req,res,next)=>
  {
    passport.authenticate('login',(err,user,info)=>{
      console.log("??????",user)
      if(err)
      {
        console.log(err)
      }
      if(info!=undefined)
      {
        res.send(info)
      }
      if(user==false)
      {
        res.status(401).json({error:"USER NOT FOUND"})
      }
      else
      {
        req.logIn(user,err=>{
          User.findOne({email:user.email}).then((use)=>{
            const token=jwt.sign({id:user.email},JWT_SECRET)
            res.status(200).send({
              user:use,
              token:token
            })
          })
        })
      }
    })(req,res,next)
  }
  ,
  logout: (req, res, next) => {
    res.json({ success: 'ok' })
  },
  logoutAll: (req, res, next) => {
    res.json({ success: 'ok' })
  }
}
