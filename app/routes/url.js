var express = require('express')
var router = express.Router()
const Url = require('../models/ShortUrl');

function validURL(myURL) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ 
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ 
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ 
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ 
    '(\\?[;&amp;a-z\\d%_.~+=-]*)?'+ 
    '(\\#[-a-z\\d_]*)?$','i');
    return pattern.test(myURL);
 }

router.post('/shorten',async (req,res) => {
    const longurl =  req.body;
    var baseurl = req.get('host');
    const urlcode = Date.now();
    if(validURL(longurl.longurl)){
        try {
            var url = await Url.findOne(longurl)
            if(url){
                res.json(url)
            }else{
                var shorturl = baseurl + '/' + urlcode;
                url = new Url({
                    longurl : longurl.longurl,
                    shorturl,
                    urlcode
                })
                await url.save();
                res.json(url);
            }
        } catch (error) {
            console.log(error);
            res.json('Server error');
        }
    }else{
        res.json('invalid long url');
    }
})

module.exports = router