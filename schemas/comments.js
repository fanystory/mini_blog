const mongoose = require("mongoose");

//------------------------------------------------------------
//  💾 스키마: comments
//------------------------------------------------------------

const commentsSchema = mongoose.Schema({
    commentId:{
        type: Number,
        required: true,
    },
    commentTargetArticleId:{
        type: Number,
        required: true,
    },
    commentAuthorId:{
        type: String,
        required: true,
    },
    commentContent:{
        type: String,
        required: true,
    },
    commentDate:{
        type: Date,
        required: true,
    },
});

const model = mongoose.model("Comments", commentsSchema);
module.exports = model;