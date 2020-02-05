const passport=require('passport')
const localstrategy=require('passport-local').Strategy;
const User=require('../models/User')
const bcrypt=require('bcrypt')
const JWTStrategy=require('passport-jwt').Strategy
const ExtractJWT=require('passport-jwt').ExtractJwt
passport.use('login',new localstrategy({
    usernameField:'user',
    passportField:'password',
},function(email,password,done)
{
try{
    User.findOne({email:email}).then((data)=>{
        if(data==null)
        {
            return done(null,false)
        }
        else
        {

         
            bcrypt.compare(password,data.password).then((val)=>{
                if(val==true)
                {
                        return done(null,data);
                }
                else
                {
                    return done(null,false,{message:"PASSWORD DOES NOT MATCH"})
                }

            })
            
            
        }
    })
}
catch(err){
done(err)
}  
}))

const opts={
    jwtFromRequest:ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey:process.env.JWT_SECRET
}
passport.use('jwt',new JWTStrategy(opts,(jwtpayload,done)=>{
    try{
        User.findOne({
            email:jwtpayload.id
        }).then((user)=>{
            
            if(user)
            {
                done(null,user)
            }
            else
            {
                done(null,false)
            }
        })
    }
    catch(err)
    {
        done(err)
    }
}))
