const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");

const User = require("../schemas/users.js");
const Joi = require("joi");

const Potato = require("bcrypt");
const saltRounds = 10;




//------------------------------------------------------------
//  🧑🏻‍💻 USER 라우터
//------------------------------------------------------------

// 회원 가입
router.post("/user", async (req, res) => {
    const { userId, userPassword, userPasswordConfirm, userEmail, userNickname } = req.body;


    // 입력 항목 검증
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
                    "errorMessage":"입력 값을 확인하세요.",
                    "errorDetail":err
                });
    }

    // ID / EMAIL 중복 체크
    const checkSameUser = await User.find({
        $or: [{userId}, {userEmail}],
    });

    if(checkSameUser.length){
        return res.status(400)
                .json({
                    "errorType":"exist",
                    "errorMessage":"ID 혹은 이메일이 이미 사용되었습니다."
                });
    }


    // 비밀번호 해싱
    const hashedPassword = Potato.hashSync(userPassword, saltRounds);
    //console.log(Potato.compareSync(userPassword, 'hash'));
    //로그인할 때 이거 쓰셈

    // 가입 날짜 가져오기
    const userDate = new Date();

    // 회원 객체 만들기
    const user = new User({ userId,
                            userPassword: hashedPassword,
                            userEmail,
                            userNickname,
                            userDate
                        });


    // 저장!
    try{
        await user.save();
        console.log(`💾DB: NEW USER - ${userId}`)
        res.status(201).json({
            "successMessage": "회원가입에 성공했습니다."
        })
    }catch(err){
        return res.status(503)
                .json({
                    "errorType":"server",
                    "errorMessage":"신규 회원 저장에 실패",
                    "errorDetail": err
                });
    }
});


//------------------------------------------------------------
//  🧑🏻‍💻 AUTH 라우터
//------------------------------------------------------------

//로그인
router.post("/auth", async (req,res) => {
    const { userId, userPassword } = req.body;

    //유저 찾기
    try{
        const loginUser = await User.findOne({ userId });

        //console.log(loginUser);

        if(loginUser == null){
            return res.status(400)
                .json({
                    "errorType":"match",
                    "errorMessage":"ID 혹은 비밀번호가 일치하지 않음"
                });
        }

        if(!Potato.compareSync(userPassword, loginUser.userPassword)){
            return res.status(400)
                    .json({
                        "errorType":"match",
                        "errorMessage":"ID 혹은 비밀번호가 일치하지 않음"
                    });
        }
    }catch(error){
        return res.status(400)
                .json({
                    "errorType":"server",
                    "errorMessage":"서버에서 정보 조회를 실패했습니다."
                });
    }

    const token = jwt.sign({userId}, "sPRta@KEy#seCrEt");

    res.status(200)
        .json({
            "successMessage":"로긔인 성공!",
            token,
        });
    
});

//------------------------------------------------------------
//  🏄‍♂️ 모듈 내보내기
//------------------------------------------------------------

module.exports = router;