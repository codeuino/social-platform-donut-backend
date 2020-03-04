const User = require('../models/User')
const crypto=require('crypto')
const bcrypt=require('bcrypt');
const Token=require('../models/token');
const nodemailer=require('nodemailer')
const config=require('../../config/default.json')
let transporter = nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:config.Nodemailer.dbConfig.email,
    pass:config.Nodemailer.dbConfig.password
  }
});
console.log(transporter)
function sendmail(user,token,req)
{
console.log(user,token,req)
  return new Promise((resolve,reject)=>{

 
    transporter.sendMail({
      from:"xyz@gmail.com",
      to:user.email,
      subject:"Password Reset @DONUT",
      html: '<h4><b>Reset Password</b></h4>' +'<p>To reset your password, complete this form:</p>' +'<a href='+req.headers.host+'/reset/'+ user.id+'/'+ token + '">' + 'http://'+req.headers.host + '/auth/reset?id=' + user.id + '&token=' + token + '</a>' +'<br><br>' +'<p>--Team</p>'
    },(err,info)=>{
      console.log(info,err)
      if(err)
      {
        console.log("MAILER ERROR")
        reject(err)
      }
      else
      {
        resolve(info)
      }
    })
  })
  
  

}

function maketoken(token)
{
  return new Promise((resolve,reject)=>{
    bcrypt.hash(token,10,function(err,hash){
      if(err)
      {
        console.log("TOken error")
        reject(err)
      }
      else
      {
        console.log(hash)
        resolve (hash);
      }
    })
  })
}

module.exports = {
  changepassword:async(req,res,next)=>{
    try{
      let id=req.query.id;
      let password=req.body.password;
      console.log(id)
      console.log(password)
      let user=await User.findOne({_id:id});
      console.log(user)
      user.password=password;
      user.save();
      return res.status(200).json({success:'DONE WITH PASSWORD'});
    }
    catch(err)
    {
      return res.status(400).json({error:err});
    }
  },
  checkvalidity:async(req,res,next)=>{
    let id=req.query.id;
    let token=req.query.token;
    console.log(token)
    let validity=await Token.findOne({token:token});
    console.log(validity)
    if(validity)
    {
      return res.status(200).json({success:"Link is active"})
    }
    else
    {
      return res.status(400).json({error:"TOken expired"})
    }


  },
  forgetpassword:async(req,res,next)=>{
    const email=req.body.email;
    try{
      let temp_user=await User.findOne({email:email});
      if(temp_user)
      { 
        let tok=await Token.findOneAndDelete({user:temp_user.id});
        let token = crypto.randomBytes(32).toString('hex')
        let genratedtoken=await maketoken(token);
        let createdtoken=await Token.create({user:temp_user.id,token:genratedtoken});
        if(!createdtoken)
        {
          return res.stat(400).send({error:"Issue creating record"});
        }
        else
        {
            console.log(createdtoken)
          let mailSent=await sendmail(temp_user,createdtoken.token,req)
          console.log("!!!",mailSent)
          if(mailSent)
          {
            return res.status(200).send({success:"MAIL SENT SUCCESSFULLY"})
          }
          else
          {
            console.log("SOMETHING WENT WRONG")
          }
        }
      }
      else
      {
          return res.status(400).send({error:"User not found"});
      }
    }
    catch(error)
    {
      console.log("!!!!!!",error)
      res.status(400).send({error:error})
    }
  },

  authenticateUser: async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    try {
      const user = await User.findByCredentials(email, password)
      const token = await user.generateAuthToken()
      res.send({ user: user, token: token })
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // console.log('error ', error)
      }
      res.status(400).send({ error: error })
    }
  },
  logout: (req, res, next) => {
    res.json({ success: 'ok' })
  },
  logoutAll: (req, res, next) => {
    res.json({ success: 'ok' })
  }
}
