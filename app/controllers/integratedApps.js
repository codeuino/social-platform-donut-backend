const User = require('../models/User');
const Discourse = require('../models/Discourse');

module.exports = {
    IntegrateApp: function(req,res,next){
        const app = req.params.app
        
        //Check which app is being integrated
        if(app === 'discourse'){
            //Save the discourse url of the organization to integrate it
            const organizationDiscourse = req.body.url
            const discourseInfo = {
                app: 'discourse',
                organizationUrl: organizationDiscourse
            }
            const userId = req.user.id;
            User.findById({_id: userId},async function(err,result){
                if(err){
                    next(err)
                }else if(result.integratedApps.filter(e=>e.app === 'discourse').length<=0){
                    result.integratedApps.push(discourseInfo);
                    await result.save();
                    const discourse = new Discourse({
                        userId,
                        organizationUrl: organizationDiscourse
                    })
                    discourse.save();
                    res.json({
                            status: 'success', 
                            message: 'App integrated successfully', 
                            data: null,
                            discourse
                    })
                }else{
                    return res.json({
                        status: 'success',
                        message: 'App already integrated',
                        data: null
                    })
                }
            })
        }
    },

    AllIntegratedApps: function(req,res,next){
        const userId = req.user.id;
        User.findById({_id:userId}, function(err,result){
            if(err){
                next(err);
            }else{
                return res.json({
                    status: 'success',
                    message: 'User found',
                    data: {
                        allApps: result.integratedApps
                    }
                })
            }
        })
    }

}