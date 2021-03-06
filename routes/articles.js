const express = require("express");
const Articles = require("../schemas/articles")
const Comments = require("../schemas/comments")
const jwt = require("jsonwebtoken");
const router = express.Router();

const checkAuthMiddleware = require("../middlewares/check_auth");
const { cookie } = require("express/lib/response");

//------------------------------------------------------------
//  ๐ง๐ปโ๐ป ๋ผ์ฐํฐ
//------------------------------------------------------------

// GET: article ๋ชฉ๋ก ๋ถ๋ฌ์ค๊ธฐ
router.get("/articles", async (req, res) => {
    const articlesList = await Articles.find({})
                                .sort("-articlePostDate")
                                .select("articleId articleSubject articleAuthorId articlePostDate articleContent");

    res
        .status(200)
        .json({articlesList});
});

// POST: ์ ๊ท article ์๋ก๋
router.post("/articles", checkAuthMiddleware, async (req, res) => {
    const { articleSubject, articleContent } = req.body;

    const lastArticleObject = await Articles.findOne().sort({articlePostDate: -1}); //ํฌ์คํธ ๋ ์ง ๊ธฐ์ค ๊ฐ์ฅ ๋ง์ง๋ง ๊ฒ์๋ฌผ ๊ฐ์ ธ์ด
    let lastArticleId = 1;
    if(lastArticleObject){
        lastArticleId = lastArticleObject.articleId + 1;
    }else{ //์์ง ํ๋๋ ๊ฒ์๋๊ฒ ์์ผ๋ฉด 1๋ฒ์
        lastArticleId = 1;
    }

    const {authorization} = req.headers;
    const [tokenType, tokenValue] = authorization.split(' ');
    const decoded = jwt.verify(tokenValue, "sPRta@KEy#seCrEt");

    const articleAuthorId = decoded.userId;
    const articlePostDate = new Date();

    try{
        const postArticle = await Articles.create({ articleId:lastArticleId, articleSubject, articleContent, articleAuthorId, articlePostDate });
        res
            .status(201)
            .json({ success:true, message:"๊ฒ์๋ฌผ ์ฌ๋ฆฌ๊ธฐ ์ฑ๊ณต!" });
    }catch(error){
        res
            .status(400)
            .json({ success:false, message:"ํ .." });
    }
    
});


// GET: ํน์  article ๋ด์ฉ ์กฐํ
router.get("/articles/:articleId", async (req, res)=>{
    const { articleId } = req.params;

    const article = await Articles.find({ articleId:Number(articleId) })
                                    .select("articleId articleSubject articleAuthorId articlePostDate articleContent");

    if(article.length){
        res.status(200)
            .json({ success:true, article });
    }else{
        res.status(400)
            .json({ success:false, errorMessage:"ํด๋น article์ ์กด์ฌํ์ง ์์ต๋๋ค." });
    }
});

// PATCH: ํน์  article ์์ ํ๊ธฐ
router.patch("/articles/:articleId", checkAuthMiddleware, async (req, res)=>{
    const { articleId } = req.params;
    const { articleSubject, articleContent } = req.body;

    const article = await Articles.findOne( { articleId: Number(articleId) } );

    if(!article){
        return res.status(400)
                .json({ success:false, errorMessage:"ํด๋น article์ด ์กด์ฌํ์ง ์์ ์์ ํ  ์ ์์ต๋๋ค." });
    }

    await Articles.updateOne({ articleId: Number(articleId) }, { $set: { articleSubject, articleContent } });

    res.status(201)
        .json({ success:true, editedArticle : { 
                                            articleSubject: article.articleSubject,
                                            articleContent: article.articleContent
                                        } });
});

// POST: ์ ๊ท ์ฝ๋ฉํธ ์์ฑ
router.post("/articles/:articleId/comments", checkAuthMiddleware, async (req, res)=>{
    const { articleId } = req.params;
    const { commentContent } = req.body;
    const lastCommentObject = await Comments.findOne().sort({commentDate: -1}); //ํฌ์คํธ ๋ ์ง ๊ธฐ์ค ๊ฐ์ฅ ๋ง์ง๋ง ๋๊ธ ๊ฐ์ ธ์ด

    let lastCommentId = 1;
    if(lastCommentObject){
        lastCommentId = lastCommentObject.commentId + 1;
    }else{ //์์ง ํ๋๋ ๊ฒ์๋๊ฒ ์์ผ๋ฉด 1๋ฒ์
        lastCommentId = 1;
    }

    const {authorization} = req.headers;
    const [tokenType, tokenValue] = authorization.split(' ');
    const decoded = jwt.verify(tokenValue, "sPRta@KEy#seCrEt");

    const commentAuthorId = decoded.userId;
    const commentDate = new Date();


    try{
        const postComment = await Comments.create({
                                                    commentId: lastCommentId,
                                                    commentTargetArticleId: articleId,
                                                    commentAuthorId: commentAuthorId,
                                                    commentContent: commentContent,
                                                    commentDate: commentDate
                                                 });

        res
            .status(201)
            .json({ success:true, message:"์ฝ๋ฉํธ ์ฌ๋ฆฌ๊ธฐ ์ฑ๊ณต!" });
    }catch(error){
        res
            .status(400)
            .json({ success:false, message:"ํ .." });
    }
});


// DELETE: ํน์  article ์ญ์ ํ๊ธฐ
router.delete("/articles/:articleId", checkAuthMiddleware, async (req, res)=>{
    const { articleId } = req.params;

    const article = await Articles.findOne( { articleId: Number(articleId) } );

    if(!article){
        return res.status(400)
                .json({ success:false, errorMessage:"ํด๋น article์ด ์กด์ฌํ์ง ์์ ์ญ์ ํ  ์ ์์ต๋๋ค." });
    }

    // if(userId != article.articleAuthorId){
    //     return res.status(401)
    //             .json({ success:false, errorMessage:"์์ฑํ ํ์๋ง ์ญ์ ํ  ์ ์์ต๋๋ค." });
    // }

    await Articles.deleteOne({ articleId: Number(articleId) });
    await Comments.deleteMany({ commentTargetArticleId: Number(articleId) }); //์ฐ๊ฒฐ๋ ์ฝ๋ฉํธ๋ ๊ฐ์ด ์ญ์ 

    res.status(201)
        .json({ success:true });
});

// GET: ์ฝ๋ฉํธ ๋ชฉ๋ก ๋ถ๋ฌ์ค๊ธฐ
router.get("/articles/:articleId/comments", async (req, res)=>{
    const { articleId } = req.params;

    try{
        const commentList = await Comments.find({ commentTargetArticleId: articleId })
                                            .sort("-commentDate");
        res
            .status(200)
            .json({commentList});
        
    }catch(error){
        res
            .status(400)
            .json({ success:false, message:"์ฝ๋ฉํธ๋ฅผ ์กฐํํ๋๋ฐ ์คํจํ์" });
    }
    
});

// DELETE: ์ฝ๋ฉํธ ์ญ์ ํ๊ธฐ
router.delete("/articles/:articleId/comments/:commentId", checkAuthMiddleware, async (req, res) => {
    const { articleId, commentId } = req.params;

    try{
        const comment = await Comments.deleteOne({ commentId: Number(commentId), commentTargetArticleId: Number(articleId) });

        res
            .status(201)
            .json({ success: true, message:"์ฝ๋ฉํธ ์ญ์  ์๋ฃ" });
    }catch(error){
        res
            .status(400)
            .json({ success: false, message:"์ฝ๋ฉํธ๋ฅผ ์ฐพ์ ์ ์๊ฑฐ๋ ์๋ฒ ์ฐ๊ฒฐ์ ์คํจํ์ฌ ์ญ์  ์คํจ" });
    }
});

// PATCH: ์ฝ๋ฉํธ ์์ ํ๊ธฐ
router.patch("/articles/:articleId/comments/:commentId", checkAuthMiddleware, async (req, res) => {
    const { commentId } = req.params;
    const { commentContent } = req.body;

    try{
        //const comment = await Comments.deleteOne({ commentId });
        await Comments.updateOne({ commentId: Number(commentId) }, { $set: { commentContent } });

        res
            .status(201)
            .json({ success: true, message:"์ฝ๋ฉํธ ์์  ์๋ฃ" });
    }catch(error){
        res
            .status(400)
            .json({ success: false, message:"์ฝ๋ฉํธ๋ฅผ ์ฐพ์ ์ ์๊ฑฐ๋ ์๋ฒ ์ฐ๊ฒฐ์ ์คํจํ์ฌ ์์  ์คํจ" });
    }
});

//------------------------------------------------------------
//  ๐โโ๏ธ ๋ชจ๋ ๋ด๋ณด๋ด๊ธฐ
//------------------------------------------------------------

module.exports = router;