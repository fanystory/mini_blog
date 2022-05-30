const jwt = require("jsonwebtoken");
const User = require("../schemas/users");

module.exports = (req, res, next) =>{
    const {authorization} = req.headers;
    const [tokenType, tokenValue] = authorization.split(' ');

    if(tokenType !== 'Bearer'){
        res.status(401)
            .json({errorMessage: "로그인을 해야함"});
        return;
    }

    try{
        const decoded = jwt.verify(tokenValue, "sPRta@KEy#seCrEt");

        User.findOne({ userId: decoded.userId})
        .then((user)=>{
            res.locals.userId = user.userId;
        });

        //console.log("로그인된 사용자임");
        //console.log("decoded 값:" + decoded.userId);
    }catch(error){
        //console.log("로그인 되지 않은 사용자임");

        res.status(401)
            .json({errorMessage: "로그인을 해야함"});

        return;
    }

    next();
}