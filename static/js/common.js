//------------------------------------------------------------
//  💾 Article 관련
//------------------------------------------------------------

function getArticles(){
    $.ajax({
        type: "GET",
        url: "api/articles",
        data: {},
        success: function (response) {
            const articles = response.articlesList;
            
            for(let i=0; i < articles.length; i++){
                const temp = `<div class="card articleItem" >
                                <div class="articleClickArea" name="${articles[i].articleId}">
                                    <h5 class="card-header">${articles[i].articleSubject}</h5>
                                    <div class="card-body">
                                    <p class="card-text">${articles[i].articleContent}</p>
                                    </div>
                                </div>
                                <div class="articleButtons" name="${articles[i].articleId}">
                                    <button type="button" class="btn btn-secondary">수정</button>
                                </div>
                            </div>`;
                $('#indexArticleList').append(temp);
            }
        }
    });
}

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

$(document).on("click", ".articleClickArea", function(){
    const thisArticleId = $(this).attr('name');
    $('#detailModal_articleSubject').empty();
    $('#detailModal_articleAuthorId').empty();
    $('#detailModal_articlePostDate').empty();
    $('#detailModal_articleContent').empty();

    $.ajax({
        type: "GET",
        url: `api/articles/${thisArticleId}`,
        data: {},
        success: function (response){
            const article = response.article[0];
            
            $('#detailModal_articleSubject').append(article['articleSubject']);
            $('#detailModal_articleAuthorId').append(article['articleAuthorId']);
            $('#detailModal_articlePostDate').append(article['articlePostDate']);
            $('#detailModal_articleContent').append(article['articleContent']);
            $('#detailModal').modal('show');
        }
    });
});

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
            alert("로그인 성공\n");
            window.location.replace("/");
        }
    });
}

function logOut(){
    localStorage.clear();
    window.location.href = "/";
}