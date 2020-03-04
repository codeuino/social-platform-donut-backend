const mongoose=require('mongoose')
const schema=mongoose.Schema;


let token=new schema
({
user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
},
token:{
    type:String
},
created_at:{
    type:Date,
    expires:3600
}
})

let tok=mongoose.model('token',token)
module.exports=tok;