const mongoose = require('mongoose');
const connect = () => {
    mongoose.connect('mongodb://localhost:27017/mini_blog', { ignoreUndefined : true })
    .catch((err) => {
        console.err("🔴SERVER: DB CONNECT ERROR!",err);
    });
};

module.exports = connect;