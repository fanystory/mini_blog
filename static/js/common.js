//------------------------------------------------------------
//  💾 Article 관련
//------------------------------------------------------------

// 아티클 목록 불러오기
function getArticles(){
    $.ajax({
        type: "GET",
        url: "api/articles",
        data: {},
        success: function (response) {
            const articles = response.articlesList;
            
            for(let i=0; i < articles.length; i++){
                let temp = `<div class="card articleItem" >
                                <div class="articleClickArea" name="${articles[i].articleId}">
                                    <h5 class="card-header">${articles[i].articleSubject}</h5>
                                    <div class="card-body">
                                    <p class="card-text">${articles[i].articleContent}</p>
                                    </div>
                                </div>`;
                
                if(localStorage.getItem("token")) {
                    if(articles[i].articleAuthorId == localStorage.getItem("_userId")){
                        temp += `<div class="articleButtons">
                                        <button type="button" class="btn btn-secondary editArticleButton" name="${articles[i].articleId}">수정</button>
                                    </div>
                                </div>`;
                    }else{
                        temp += `</div>`;
                    }
                }else{
                    temp += `</div>`;
                }


                                
                $('#indexArticleList').append(temp);
            }
        }
    });
}

// 아티클 게시하기
function postArticle(){
    const _articleSubject = $('#articleSubject').val();
    const _articleContent = $('#articleContent').val();


    const temp = {
        "articleSubject": _articleSubject,
        "articleContent": _articleContent,
    };

    
    $.ajax({
        type: "POST",
        url: "api/articles",
        data: JSON.stringify(temp),
        contentType: "application/json; charset=utf-8",
        headers: {authorization: `Bearer ${localStorage.getItem("token")}`},
        error: function (req, status, err){
            if (req.status == 401){
                alert('로그인이 필요함!');
                window.location.href = "/login";
            }else if (req.status == 400){
                alert('내용을 모두 작성했는지 확인하시오');
            }else{
                alert("서버 어딘가에서 오류가남!");
            }
            
        },
        success: function (response){
            alert(response["message"]);
            location.reload();
        }
    });
}

//아티클 상세 조회
$(document).on("click", ".articleClickArea", function(){
    const thisArticleId = $(this).attr('name');
    $('#detailModal_articleId').empty();
    $('#detailModal_articleSubject').empty();
    $('#detailModal_articleAuthorId').empty();
    $('#detailModal_articlePostDate').empty();
    $('#detailModal_articleContent').empty();
    $('#commentArea').empty();

    $.ajax({
        type: "GET",
        url: `api/articles/${thisArticleId}`,
        data: {},
        success: function (response){
            const article = response.article[0];
            $('#detailModal_articleId').append(article['articleId']);
            $('#detailModal_articleSubject').append(article['articleSubject']);
            $('#detailModal_articleAuthorId').append(article['articleAuthorId']);
            $('#detailModal_articlePostDate').append(article['articlePostDate']);
            $('#detailModal_articleContent').append(article['articleContent']);
            $('#detailModal').modal('show');

            loadComment(article['articleId']);
        }
    });
});

// 아티클 수정 조회
$(document).on("click", ".editArticleButton", function(){
    const thisArticleId = $(this).attr('name');

    $('#editModal_articleId').empty();
    $('#editModal_articleSubject').val("");
    $('#editModal_articleAuthorId').empty();
    $('#editModal_articlePostDate').empty();
    $('#editModal_articleContent').val("");

    $.ajax({
        type: "GET",
        url: `api/articles/${thisArticleId}`,
        data: {},
        success: function (response){
            const article = response.article[0];
            
            $('#editModal_articleId').append(article['articleId']);
            $('#editModal_articleSubject').val(article['articleSubject']);
            $('#editModal_articleAuthorId').append(article['articleAuthorId']);
            $('#editModal_articlePostDate').append(article['articlePostDate']);
            $('#editModal_articleContent').val(article['articleContent']);
            $('#editModal').modal('show');
        }
    });
});

// 아티클 삭제
function deleteArticle(){
    const targetId = Number($('#editModal_articleId').text());
    
    let result = confirm("삭제하면 이 글은 다시 볼 수 업서 🧐");

    if(!result){
        return;
    }

    $.ajax({
        type: "DELETE",
        url: `api/articles/${targetId}`,
        data: {},
        headers: {authorization: `Bearer ${localStorage.getItem("token")}`},
        success: function (response){
            alert("삭제 끗");
            window.location.href = "/";
        },
        error: function (error){
            alert(error);
        }
    });
}

// 아티클 수정
function editArticle(){
    const targetId = Number($('#editModal_articleId').text());
    
    let result = confirm("수정하면 돌이킬수 업서 🧐");

    if(!result){
        return;
    }

    const articleSubject = $('#editModal_articleSubject').val();
    const articleContent = $('#editModal_articleContent').val();

    $.ajax({
        type: "PATCH",
        url: `api/articles/${targetId}`,
        data: {
            articleSubject,
            articleContent
        },
        headers: {authorization: `Bearer ${localStorage.getItem("token")}`},
        success: function (response){
            alert("수정 완료");
            window.location.href = "/";
        },
        error: function (error){
            alert(error);
        }
    });
}

// 댓글 작성
function postComment(){
    const targetId = Number($('#detailModal_articleId').text());
    const commentContent = $('#commentInput').val();

    const temp = {
        "commentContent": commentContent
    };

    $.ajax({
        type: "POST",
        url: `api/articles/${targetId}/comments`,
        data: JSON.stringify(temp),
        contentType: "application/json; charset=utf-8",
        headers: {authorization: `Bearer ${localStorage.getItem("token")}`},
        error: function (req, status, err){
            alert(err);
        },
        success: function (response){
            alert("코멘트 업로드 완료");
            location.reload();
        }
    });
}

// 코멘트 불러오기
function loadComment(articleNum){
    $.ajax({
        type: "GET",
        url: `api/articles/${articleNum}/comments`,
        data: {},
        success: function (response) {
            const comments = response.commentList;
            
            for(let i=0; i < comments.length; i++){
                let temp;

                if(localStorage.getItem("_userId") == comments[i]['commentAuthorId']){
                    temp = `<li name="${comments[i]['commentId']}"><span class="commentIdAreaMe">${comments[i]['commentAuthorId']}</span> ${comments[i]['commentContent']} <a href="javascript:editComment(${articleNum}, ${comments[i]['commentId']}, '${comments[i]['commentContent']}')">[E]</a><a href="javascript:deleteComment(${articleNum}, ${comments[i]['commentId']})" style="color:red">[D]</a></li>`;
                }else{
                    temp = `<li name="${comments[i]['commentId']}"><span class="commentIdArea">${comments[i]['commentAuthorId']}</span> ${comments[i]['commentContent']}</li>`;
                }
                
                
                $('#commentArea').append(temp);
            }
        }
    });
}

// 코멘트 삭제하기
function deleteComment(articleNum, commentId){
    let result = confirm("삭제하면 이 댓글을 다시 볼 수 업서 🧐");

    if(!result){
        return;
    }

    $.ajax({
        type: "DELETE",
        url: `api/articles/${articleNum}/comments/${commentId}`,
        data: {},
        headers: {authorization: `Bearer ${localStorage.getItem("token")}`},
        success: function (response) {
            console.log(response);
            alert(response.message);
            window.location.href = "/";
        },
        error: function (err){
            console.log(err);
            alert("삭제 실패");
        }
    });
}

// 코멘트 수정하기
function editComment(articleNum, commentId, commentContent){
    let result = prompt("수정할 내용", commentContent);

    if(!result){
        return;
    }

    $.ajax({
        type: "PATCH",
        url: `api/articles/${articleNum}/comments/${commentId}`,
        data: { commentContent: result },
        headers: {authorization: `Bearer ${localStorage.getItem("token")}`},
        success: function (response) {
            console.log(response);
            alert(response.message);
            window.location.href = "/";
        },
        error: function (err){
            console.log(err);
            alert("수정 실패");
        }
    });
}

//------------------------------------------------------------
//  🧑🏻‍💻 가입 / 로그인
//------------------------------------------------------------

function signIn(){
    const _id = $('#inputId').val();
    const _password = $('#inputPassword').val();
    const _passwordConfirm = $('#inputPasswordConfirm').val();
    const _email = $('#inputEmail').val();
    const _nickname = $('#inputNickname').val();

    const temp = {
        "userId": _id,
        "userPassword": _password,
        "userPasswordConfirm": _passwordConfirm,
        "userEmail": _email,
        "userNickname": _nickname
    };

    
    $.ajax({
        type: "POST",
        url: "api/user",
        data: JSON.stringify(temp),
        contentType: "application/json; charset=utf-8",
        error: function (err){
            //console.log(err);
            $('#divErrMsg').empty();
            let errMessageTemp = "";

            if(err['responseJSON']['errorType'] == "validate"){
                for(let i=0; i<err['responseJSON']['errorDetail']['details'].length; i++){
                    errMessageTemp += err['responseJSON']['errorDetail']['details'][i]["message"];
                }
            }else if(err['responseJSON']['errorType'] == "exist"){
                errMessageTemp += err['responseJSON']['errorMessage'];
            }
            
            //alert(err['responseJSON']['errorMessage']);
            $('#divErrMsg').append(errMessageTemp);
        },
        success: function (response){
            //alert(response.message);
            $('#divErrMsg').empty();
            alert(response.successMessage);
            window.location.href = "/login";
        }
        
    });
}


function logIn(){
    const _id = $('#inputId').val();
    const _password = $('#inputPassword').val();

    const temp = {
        "userId": _id,
        "userPassword": _password
    };

    $.ajax({
        type: "POST",
        url: "api/auth",
        data: JSON.stringify(temp),
        contentType: "application/json; charset=utf-8",
        error: function (err){
            $('#divErrMsg').empty();
            const errMessageTemp = err['responseJSON']['errorMessage'];
            $('#divErrMsg').append(errMessageTemp);
        },
        success: function(response){
            $('#divErrMsg').empty();

            localStorage.setItem("token", response.token);
            localStorage.setItem("_userId", response.userId);
            localStorage.setItem("_userNickname", response.userNickname);

            alert(response.userNickname + "님 로긔인 성공");
            window.location.replace("/");
        }
    });
}

function logOut(){
    localStorage.clear();
    window.location.href = "/";
}