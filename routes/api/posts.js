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

//Put, /api/post/like/:id , like a post , private

router.put('/like/:id', auth, async (req, res)=> {
    try {
        const post = await Post.findById(req.params.id);
    
        // Check if the post has already been liked
        if (post.likes.some(like => like.user.toString() === req.user.id)) {
          return res.status(400).json({ msg: 'Post already liked' });
        }
        
        post.likes.unshift({ user: req.user.id });
        // console.log('hy');
        await post.save();
    
        return res.json(post.likes);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
});

//Put, /unlike/:id , unlike a post , private

router.put('/unlike/:id', auth, async (req, res)=> {
    try {
        const post = await Post.findById(req.params.id);
    
        // Check if the post has already been unliked
        if (!post.likes.some(like => like.user.toString() == req.user.id)) {
          return res.status(400).json({ msg: 'Post has not yet being liked' });
        }

        //Get the remove index

        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);
        await post.save();

        return res.json(post.likes);
         // console.log('hy');
         
    
        return res.json(post.likes);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
    '/comment/:id', auth, postValidator, runValidation, 
    async (req, res) => {

      try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);
  
        const newComment = {
          text: req.body.text,
          name: user.name,
          avatar: user.avatar,
          user: req.user.id
        };
  
        post.comments.unshift(newComment);
  
        await post.save();
  
        res.json(post.comments);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );
  
  // @route    DELETE api/posts/comment/:id/:comment_id
  // @desc     Delete comment
  // @access   Private
  router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      // Pull out comment
      const comment = post.comments.find(
        comment => comment.id === req.params.comment_id
      );
      // Make sure comment exists
      if (!comment) {
        return res.status(404).json({ msg: 'Comment does not exist' });
      }
      // Check user
      if (comment.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
  
      post.comments = post.comments.filter(
        ({ id }) => id !== req.params.comment_id
      );
  
      await post.save();
  
      return res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  });






module.exports = router;