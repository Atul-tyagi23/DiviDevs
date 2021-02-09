const { response } = require('express');
const express = require('express');
const { Mongoose } = require('mongoose');
const router = express.Router();
const auth = require('../../middlewares/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const {profileValidator, experienceValidator, educationValidator} = require('../../validators/auth');
const {runValidation} = require('../../validators/index');
const request = require('request');
require('dotenv').config()





// api/profile/me, get own profile route, private
router.get('/me', auth, async (req, res)=>{
   // console.log('in me ');
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', 
        ['name', 'avatar']);
      //  console.log(profile)

        if(!profile){
            return res.status(200).json({message: "There is no profile for this user"})
        }
        return res.status(200).json({profile});

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

// Delete , api/profile/delete ,  delete profile, user, post, private 


router.delete('/', auth, async (req, res) =>{
    try {
         await Profile.findOneAndRemove({user: req.user.id});
         await User.findOneAndRemove({_id: req.user.id});
         
         return res.json({message: "User deleted"})
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')      
    }
});

//put, add experience, private
router.put('/experience', auth, experienceValidator, runValidation, async (req, res) => {
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      } = req.body;
  
      const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      };
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.experience.unshift(newExp);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
});

// delete, profile exp, private

router.delete('/experience/:exp_id', auth, async (req, res)=> {
        try {
            const profile = await Profile.findOne({ user: req.user.id }); 
            const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

            profile.experience.splice(removeIndex, 1);
            await profile.save();

            res.json({profile})

        } catch (error) {
            console.error(err.message);
        res.status(500).send('Server Error');
        }
});

//put, add education, private
router.put('/education', auth, educationValidator, runValidation, async (req, res) => {
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      } = req.body;
  
      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      };
      console.log(newEdu);
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.education.unshift(newEdu);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
});
// delete education
router.delete('/education/:edu_id', auth, async (req, res)=> {
    try {
        const profile = await Profile.findOne({ user: req.user.id }); 
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);
        await profile.save();

        res.json({profile})

    } catch (err) {
        console.error(err.message);
    res.status(500).send('Server Error');
    }
});

// Get request, /api/profile/github/:username , get user repos from github, public

router.get('/github/:username', async (req, res)=> {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created
            :asc&client_id=${process.env.githubClientID}&client_secret=${process.env.githubClientSecret}`,
            method: 'GET',
            headers: {'user-agent': 'node.js'}
        }
        request(options,(error, response, body) => {
            if(error) console.log(error);

            if(response.statusCode!==200) {
               return res.status(404).json({message: 'No github profile found'})
            }
            res.json(JSON.parse(body))
        })
        
    } catch (error) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})
 





module.exports = router;