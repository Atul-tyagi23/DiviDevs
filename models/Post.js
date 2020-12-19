const mongoose = require('mongoose');
const { schema } = require('./Profile');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    text: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    avatar: {
        type: String
    },
    likes :[
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    comments: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref : 'user'
          },
          text: {
            type: String,
            required: true
          },
          name: {
            type: String
          },
          avatar: {
            type: String
          },
          date: {
            type: Date,
            default: Date.now
          }
        }
      ],
      date: {
        type: Date,
        default: Date.now
      }
});

module.exports = Post =  mongoose.model('post', PostSchema);
