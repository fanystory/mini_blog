const mongoose = require("mongoose");

//------------------------------------------------------------
//  💾 스키마: articles
//------------------------------------------------------------

const articlesSchema = mongoose.Schema({
    articleId:{             // 1. 게시글 고유 ID
        type: Number,
        required: true,
        unique: true,
    },
    articleSubject:{        // 2. 게시글 제목
        type: String,
        required: true,
    },
    articleContent:{        // 3. 게시글 내용
        type: String,
        required: true,
    },
    articleAuthorId:{       // 4. 게시글 작성자 고유 ID
        type: Number,
        required: true,
    },
    articlePostDate:{       // 5. 게시글 작성 날짜
        type: Date,
        required: true,
    },
    articlePassword:{       // 6. 게시글 수정/삭제 시 필요한 비밀번호
        type: String,
        required: true,
    }
});

const model = mongoose.model("Articles", articlesSchema);
module.exports = model;