const express = require('express');
const router = express.Router();
const {signupValidator} = require('../../validators/auth');
const {runValidation} = require('../../validators/index')
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

 

// api/post, register route, public

router.post('/', signupValidator, runValidation, async (req, res) => {

    const {name, email, password} = req.body;

    try {
        let user = await User.findOne({email});
        if(user){
           return res.status(400).json({errors: [{msg:"User with same already exist"}]})
        }

        const avatar = gravatar.url(email, {
            s: "200",
            r: "pg", // No bad pix
            d: "mm"
        })

        user = new User({
            name,
            email,
            avatar,
            password
        })

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt)
        await user.save()
        
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
                if(err) res.status(500).json('Server error')
                res.json({token});
            });

    }catch(err){
        console.log(err.message)
        res.status(500).json('Server error')
    }
    
});


module.exports = router;
