const mongoose=require('mongoose')

const CommentSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    blogPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'blogs'
    }
  }, {
    timestamps: true
  });

  const commentModal=mongoose.model('comments',CommentSchema)
module.exports=commentModal