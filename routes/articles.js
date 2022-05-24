const express = require("express");
const Articles = require("../schemas/articles.js")
const router = express.Router();

//------------------------------------------------------------
//  🧑🏻‍💻 라우터
//------------------------------------------------------------

// GET: article 목록 불러오기
router.get("/articles", async (req, res) => {
    const articlesList = await Articles.find({})
                                .sort("-articlePostDate")
                                .select("articleSubject articleAuthorId articlePostDate");

    res
        .status(200)
        .json({articlesList});
});

// POST: 신규 article 업로드
router.post("/articles", async (req, res) => {
    const { articleId, articleSubject, articleContent, articleAuthorId, articlePassword } = req.body;
    
    const articlesList = await Articles.find({articleId});
    if(articlesList.length){
        return res.status(400)
                  .json({ success: false, errorMessage: "해당 articleId는 이미 존재하고 있습니다." });
    }

    const articlePostDate = new Date();
    const postArticle = await Articles.create({ articleId, articleSubject, articleContent, articleAuthorId, articlePostDate, articlePassword });
    res
        .status(201)
        .json({ success:true, postedArticle:postArticle });
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
            .json({ success:false, errorMessage:"해당 article은 존재하지 않습니다." })
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