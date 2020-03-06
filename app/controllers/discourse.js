const Discourse = require('../models/Discourse');

module.exports = {
    getOrganizationUrl: function(req,res,next){
        const userId = req.user._id;
        Discourse.findOne({userId}, function(err,result){
            if(err){
                next(err)
            }else{
                const organizationUrl = result.organizationUrl;
                return res.json({
                    status: "success",
                    message: "User found",
                    data: {
                        organizationUrl
                    }
                })
            }
        })
    }
}   