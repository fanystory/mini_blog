const mongoose = require("mongoose");

//------------------------------------------------------------
//  💾 스키마: articles
//------------------------------------------------------------

const usersSchema = mongoose.Schema({
    userId:{
        type: String,
        required: true,
    },
    userPassword:{
        type: String,
        required: true,
    },
    userEmail:{
        type: String,
        required: true,
    },
    userNickname:{
        type: String,
        required: true,
    },
    userDate:{
        type: Date,
        required: true,
    },
});


const model = mongoose.model("Users", usersSchema);
module.exports = model;