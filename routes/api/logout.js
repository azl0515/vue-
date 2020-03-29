let express = require('express')
let router = express.Router();

router.get('/',(req,res,next)=>{
  console.log('logout')
  res.end()
})

module.exports = router;