var express = require('express')
var router = express.Router()
const documentationUrl = 'https://documenter.getpostman.com/view/1159934/SWDze1Rp'
const Url = require('../models/ShortUrl');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect(documentationUrl)
})

router.get('/:shorturl',async (req,res)=>{
  try {
    const url = await Url.findOne({urlcode: req.params.shorturl});
    
    if (url) {
      return res.redirect(url.longurl);
    }
    else{
      return  res.json('No url found!');
    }
  } catch (error) {
    res.json('Server error!')
  }
});

module.exports = router
