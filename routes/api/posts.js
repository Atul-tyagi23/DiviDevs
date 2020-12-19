const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const {postValidator} = require('../../validators/auth');
const {runValidation} = require('../../validators/index')





// api/post, add posts, private 
router.post('/', auth,  postValidator, runValidation, async (req, res)=>{
    try {
        const user = await User.findById(req.user.id).select('-password');
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar : user.avatar,
            user: req.user.id,
        });
        const post = await newPost.save();
        res.json({post});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message: "Server error"})
    }
});

//Get, api/posts , get all posts, private

router.get('/', auth, async (req, res) => {
    try { 
        const posts = await Post.find().sort({date: -1})
        res.json({posts})
        
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message: "Server error"});
    }
});

//Get, api/posts/:id , get post by id, private
router.get('/:id', auth, async (req, res) => {
    try { 
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({message: "Post not found!"})
        }
        res.json({post})
    } catch (error) {
        if(error.kind === 'ObjectId'){
            return res.status(404).json({message: "Post not found!"})
        }
        console.error(error.message);
        res.status(500).json({message: "Server error"});
    }
});

// Delete post by id, private
router.delete('/:id', auth, async (req, res) => {
    try { 
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({message: "Post not found!"})
        }
         
        if(post.user.toString() !== req.user.id) {
             res.status(401).json({message: 'User not authorized'});
        }

        await post.remove();

        res.json({message: "Post Removed!"})

        
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message: "Server error"});
    }
});







module.exports = router;