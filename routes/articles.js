const express = require("express");
const Articles = require("../schemas/articles")
const Comments = require("../schemas/comments")
const jwt = require("jsonwebtoken");
const router = express.Router();

const checkAuthMiddleware = require("../middlewares/check_auth");

//------------------------------------------------------------
//  🧑🏻‍💻 라우터
//------------------------------------------------------------

// GET: article 목록 불러오기
router.get("/articles", async (req, res) => {
    const articlesList = await Articles.find({})
                                .sort("-articlePostDate")
                                .select("articleId articleSubject articleAuthorId articlePostDate articleContent");

    res
        .status(200)
        .json({articlesList});
});

// POST: 신규 article 업로드
router.post("/articles", checkAuthMiddleware, async (req, res) => {
    const { articleSubject, articleContent } = req.body;

    const lastArticleObject = await Articles.findOne().sort({articlePostDate: -1}); //포스트 날짜 기준 가장 마지막 게시물 가져옴
    let lastArticleId = 1;
    if(lastArticleObject){
        lastArticleId = lastArticleObject.articleId + 1;
    }else{ //아직 하나도 게시된게 없으면 1번임
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
            .json({ success:true, message:"게시물 올리기 성공!" });
    }catch(error){
        res
            .status(400)
            .json({ success:false, message:"흠.." });
    }
    
});


// GET: 특정 article 내용 조회
router.get("/articles/:articleId", async (req, res)=>{
    const { articleId } = req.params;

    const article = await Articles.find({ articleId:Number(articleId) })
                                    .select("articleSubject articleAuthorId articlePostDate articleContent");

    if(article.length){
        res.status(200)
            .json({ success:true, article });
    }else{
        res.status(400)
            .json({ success:false, errorMessage:"해당 article은 존재하지 않습니다." });
    }
});

// PATCH: 특정 article 수정하기
router.patch("/articles/:articleId", async (req, res)=>{
    const { articleId } = req.params;
    const { articlePassword, articleSubject, articleContent } = req.body;

    const article = await Articles.findOne( { articleId: Number(articleId) } );

    if(!article){
        return res.status(400)
                .json({ success:false, errorMessage:"해당 article이 존재하지 않아 수정할 수 없습니다." });
    }

    if(articlePassword != article.articlePassword){
        return res.status(400)
                .json({ success:false, errorMessage:"비밀번호가 다릅니다." });
    }

    await Articles.updateOne({ articleId: Number(articleId) }, { $set: { articleSubject, articleContent } });

    res.status(201)
        .json({ success:true, editedArticle : { 
                                            articleSubject: article.articleSubject,
                                            articleContent: article.articleContent
                                        } });
});

// POST: 신규 코멘트 작성
router.post("/articles/:articleId/comments", checkAuthMiddleware, async (req, res)=>{
    const { articleId } = req.params;
    const { commentContent } = req.body;
    const lastCommentObject = await Comments.findOne().sort({articlePostDate: -1}); //포스트 날짜 기준 가장 마지막 댓글 가져옴
    let lastCommentId = 1;
    if(lastCommentObject){
        lastCommentId = lastCommentObject.commentId + 1;
    }else{ //아직 하나도 게시된게 없으면 1번임
        lastCommentId = 1;
    }

    const {authorization} = req.headers;
    const [tokenType, tokenValue] = authorization.split(' ');
    const decoded = jwt.verify(tokenValue, "sPRta@KEy#seCrEt");

    const commentAuthorId = decoded.userId;
    const commentDate = new Date();

    try{
        const postArticle = await Comment.create({
                                                    commentId: lastCommentId,
                                                    commentTargetArticleId: articleId,
                                                    commentAuthorId: commentAuthorId,
                                                    commentContent: commentContent,
                                                    commentDate: commentDate
                                                 });

        res
            .status(201)
            .json({ success:true, message:"코멘트 올리기 성공!" });
    }catch(error){
        res
            .status(400)
            .json({ success:false, message:"흠.." });
    }
});

// DELETE: 특정 article 삭제하기
router.delete("/articles/:articleId", async (req, res)=>{
    const { articleId } = req.params;
    const { articlePassword } = req.body;

    const article = await Articles.findOne( { articleId: Number(articleId) } );

    if(!article){
        return res.status(400)
                .json({ success:false, errorMessage:"해당 article이 존재하지 않아 삭제할 수 없습니다." });
    }

    if(articlePassword != article.articlePassword){
        return res.status(400)
                .json({ success:false, errorMessage:"비밀번호가 다릅니다." });
    }

    await Articles.deleteOne({ articleId: Number(articleId) });

    res.status(201)
        .json({ success:true });
});

//------------------------------------------------------------
//  🏄‍♂️ 모듈 내보내기
//------------------------------------------------------------

module.exports = router;