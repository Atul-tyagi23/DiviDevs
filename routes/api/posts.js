const express = require('express');
const router = express.Router();

// api/user, test route, public 
router.get('/', (req, res)=>{
    res.send('Post route')
})





module.exports = router;