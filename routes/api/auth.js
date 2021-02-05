const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {loginValidator} = require('../../validators/auth');
const {runValidation} = require('../../validators/index');
require('dotenv').config()

// api/auth, auth route, public 
router.get('/', auth, async (req, res)=>{
    try {
        const user = await User.findById(req.user.id).select('-password')
        return res.json(user);
    }catch(err){
        console.log(err.message);
        return res.status(500).json({message: 'Server error'})  
    }
})

// api/auth, login route, public

router.post('/', loginValidator, runValidation, async (req, res) => {

    const {email, password} = req.body;

    try {
        let user = await User.findOne({email});
        if(!user){
           return res.status(400).json({errors: [{msg:"Invalid Credentials!"}]})
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            return res.status(400).json({errors: [{msg:"Invalid Credentials"}]})
        }
        
        const payload = {
            user: {
                id: user.id,
            }
        }

        jwt.sign(payload, process.env.jwtSecret,
            {
                expiresIn: 3600,
            },
            (err, token)=>{
                if(err) return res.status(500).json('Server error')
               return res.json({token});
            });

    }catch(err){
        console.log(err.message)
        res.status(500).json('Server error')
    }
    
});




module.exports = router;