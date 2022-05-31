const express = require("express");
const Articles = require("../schemas/articles")
const Comments = require("../schemas/comments")
const jwt = require("jsonwebtoken");
const router = express.Router();

const checkAuthMiddleware = require("../middlewares/check_auth");
const { cookie } = require("express/lib/response");

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
                                    .select("articleId articleSubject articleAuthorId articlePostDate articleContent");

    if(article.length){
        res.status(200)
            .json({ success:true, article });
    }else{
        res.status(400)
            .json({ success:false, errorMessage:"해당 article은 존재하지 않습니다." });
    }
});

// PATCH: 특정 article 수정하기
router.patch("/articles/:articleId", checkAuthMiddleware, async (req, res)=>{
    const { articleId } = req.params;
    const { articleSubject, articleContent } = req.body;

    const article = await Articles.findOne( { articleId: Number(articleId) } );

    if(!article){
        return res.status(400)
                .json({ success:false, errorMessage:"해당 article이 존재하지 않아 수정할 수 없습니다." });
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
    const lastCommentObject = await Comments.findOne().sort({commentDate: -1}); //포스트 날짜 기준 가장 마지막 댓글 가져옴

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
        const postComment = await Comments.create({
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
router.delete("/articles/:articleId", checkAuthMiddleware, async (req, res)=>{
    const { articleId } = req.params;

    const article = await Articles.findOne( { articleId: Number(articleId) } );

    if(!article){
        return res.status(400)
                .json({ success:false, errorMessage:"해당 article이 존재하지 않아 삭제할 수 없습니다." });
    }

    // if(userId != article.articleAuthorId){
    //     return res.status(401)
    //             .json({ success:false, errorMessage:"작성한 회원만 삭제할 수 있습니다." });
    // }

    await Articles.deleteOne({ articleId: Number(articleId) });
    await Comments.deleteMany({ commentTargetArticleId: Number(articleId) }); //연결된 코멘트도 같이 삭제

    res.status(201)
        .json({ success:true });
});

// GET: 코멘트 목록 불러오기
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
            .json({ success:false, message:"코멘트를 조회하는데 실패했음" });
    }
    
});

// DELETE: 코멘트 삭제하기
router.delete("/articles/:articleId/comments/:commentId", checkAuthMiddleware, async (req, res) => {
    const { articleId, commentId } = req.params;

    try{
        const comment = await Comments.deleteOne({ commentId: Number(commentId), commentTargetArticleId: Number(articleId) });

        res
            .status(201)
            .json({ success: true, message:"코멘트 삭제 완료" });
    }catch(error){
        res
            .status(400)
            .json({ success: false, message:"코멘트를 찾을 수 없거나 서버 연결에 실패하여 삭제 실패" });
    }
});

// PATCH: 코멘트 수정하기
router.patch("/articles/:articleId/comments/:commentId", checkAuthMiddleware, async (req, res) => {
    const { commentId } = req.params;
    const { commentContent } = req.body;

    try{
        //const comment = await Comments.deleteOne({ commentId });
        await Comments.updateOne({ commentId: Number(commentId) }, { $set: { commentContent } });

        res
            .status(201)
            .json({ success: true, message:"코멘트 수정 완료" });
    }catch(error){
        res
            .status(400)
            .json({ success: false, message:"코멘트를 찾을 수 없거나 서버 연결에 실패하여 수정 실패" });
    }
});

//------------------------------------------------------------
//  🏄‍♂️ 모듈 내보내기
//------------------------------------------------------------

module.exports = router;