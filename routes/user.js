const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");

const User = require("../schemas/users.js");
const Joi = require("joi");

const Potato = require("bcrypt");
const saltRounds = 10;




//------------------------------------------------------------
//  π§π»βπ» USER λΌμ°ν°
//------------------------------------------------------------

// νμ κ°μ
router.post("/user", async (req, res) => {
    const { userId, userPassword, userPasswordConfirm, userEmail, userNickname } = req.body;


    // μλ ₯ ν­λͺ© κ²μ¦
    userSchema = Joi.object({
        userId:             Joi.string()
                                .min(5)
                                .max(15)
                                .required(),
        userPassword:       Joi.string()
                                .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
                                .required(),
        userPasswordConfirm:Joi.ref("userPassword"),
        userEmail:          Joi.string()
                                .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
                                .required(),
        userNickname:       Joi.string()
                                .min(3)
                                .max(10)
                                .required()
    });

    try{
        const vali = await userSchema.validateAsync({userId, userPassword, userPasswordConfirm, userEmail, userNickname});
    }catch(err){
        return res.status(400)
                .json({
                    "errorType":"validate",
                    "errorMessage":"μλ ₯ κ°μ νμΈνμΈμ.",
                    "errorDetail":err
                });
    }

    // ID / EMAIL μ€λ³΅ μ²΄ν¬
    const checkSameUser = await User.find({
        $or: [{userId}, {userEmail}],
    });

    if(checkSameUser.length){
        return res.status(400)
                .json({
                    "errorType":"exist",
                    "errorMessage":"ID νΉμ μ΄λ©μΌμ΄ μ΄λ―Έ μ¬μ©λμμ΅λλ€."
                });
    }


    // λΉλ°λ²νΈ ν΄μ±
    const hashedPassword = Potato.hashSync(userPassword, saltRounds);
    //console.log(Potato.compareSync(userPassword, 'hash'));
    //λ‘κ·ΈμΈν  λ μ΄κ±° μ°μ

    // κ°μ λ μ§ κ°μ Έμ€κΈ°
    const userDate = new Date();

    // νμ κ°μ²΄ λ§λ€κΈ°
    const user = new User({ userId,
                            userPassword: hashedPassword,
                            userEmail,
                            userNickname,
                            userDate
                        });


    // μ μ₯!
    try{
        await user.save();
        console.log(`πΎDB: NEW USER - ${userId}`)
        res.status(201).json({
            "successMessage": "νμκ°μμ μ±κ³΅νμ΅λλ€."
        })
    }catch(err){
        return res.status(503)
                .json({
                    "errorType":"server",
                    "errorMessage":"μ κ· νμ μ μ₯μ μ€ν¨",
                    "errorDetail": err
                });
    }
});


//------------------------------------------------------------
//  π§π»βπ» AUTH λΌμ°ν°
//------------------------------------------------------------

//λ‘κ·ΈμΈ
router.post("/auth", async (req,res) => {
    const { userId, userPassword } = req.body;

    let loginUser;
    //μ μ  μ°ΎκΈ°
    try{
        loginUser = await User.findOne({ userId });

    }catch(error){
        return res.status(400)
                .json({
                    "errorType":"server",
                    "errorMessage":"μλ²μμ μ λ³΄ μ‘°νλ₯Ό μ€ν¨νμ΅λλ€."
                });
    }

    if(loginUser == null){
        return res.status(400)
            .json({
                "errorType":"match",
                "errorMessage":"ID νΉμ λΉλ°λ²νΈκ° μΌμΉνμ§ μμ"
            });
    }

    if(!Potato.compareSync(userPassword, loginUser.userPassword)){
        return res.status(400)
                .json({
                    "errorType":"match",
                    "errorMessage":"ID νΉμ λΉλ°λ²νΈκ° μΌμΉνμ§ μμ"
                });
    }

    const token = jwt.sign({userId}, "sPRta@KEy#seCrEt");

    console.log(loginUser.userNickname);

    res.status(200)
        .json({
            "successMessage":"λ‘κΈμΈ μ±κ³΅!",
            token,
            userId: loginUser.userId,
            userNickname: loginUser.userNickname,
        });
    
});

//------------------------------------------------------------
//  πββοΈ λͺ¨λ λ΄λ³΄λ΄κΈ°
//------------------------------------------------------------

module.exports = router;