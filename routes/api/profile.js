const express = require('express');
const { Mongoose } = require('mongoose');
const router = express.Router();
const auth = require('../../middlewares/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const {profileValidator} = require('../../validators/auth');
const {runValidation} = require('../../validators/index');




// api/profile/me, get own profile route, private
router.get('/me', auth, async (req, res)=>{
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', 
        ['name', 'avatar']);

        if(!profile){
            return res.status(400).json({message: "There is no profile for this user"})
        }
        return res.this.status(200).json({profile});

    }catch(err){
        console.log(err);
        return res.status(500).json({message: "server error"})
    }
});

//Post: /api/profile , create update profiles , private

router.post('/',auth, profileValidator, runValidation, async (req, res) => {
   
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
      } = req.body;

    // Build profile object 
    const profileFields = {}
    
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Build Social objext 
    profileFields.social = {}
    if(youtube) profileFields.social.youtube = youtube;
    if(facebook) profileFields.social.facebook = facebook;
    if(twitter) profileFields.social.twitter = twitter;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;

    try {
        let profile = await Profile.findOne({user: req.user.id })
        console.log('hy');

        if(profile){
            profile_id = profile.id;
            profile = await Profile.findByIdAndUpdate(
                profile_id, 
                { $set: profileFields },
                {new: true}
            );
            return res.json({profile});
        }

        //Create 
        profile = new Profile(profileFields);
        await profile.save();
        return res.json(profile);

    }catch(err) {
        console.log(err);
        return res.status(500).json({message: "server error"})
    }

    console.log(profileFields.skills)
    res.send('hello');
} )

// get , api/profile ,  get user's profile, public 

router.get('/', async (req, res) =>{
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        return res.json({profiles})
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')      
    }
})


// get , api/profile/user/user_id ,  get profile by user_id, public 

router.get('/user/:user_id', async (req, res) =>{
    try {
        const profile = await Profile.findOne({user: req.params.user_id
         }).populate('user', ['name', 'avatar']);
        
        if(!profile)
         return res.status(400).json({message: "There is no profile for this user!"})
      
         return res.json({profile})
    } catch (err) {
        if(err.kind == 'ObjectId') {
            return res.status(400).json({message: "There is no profile for this user!"})
        }
        console.log(err.message);
        res.status(500).send('Server Error')      
    }
})






module.exports = router;