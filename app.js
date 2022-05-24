//------------------------------------------------------------
//  👀 셋팅 영역
//------------------------------------------------------------
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

const connect = require('./schemas/');
connect();

const articlesRouter = require("./routes/articles");

//------------------------------------------------------------
//  🧑🏻‍💻 미들웨어
//------------------------------------------------------------

const requestMiddleware = (req, res, next) => {
    const nowDate = new Date();
    console.log(`🟠CLIENT: ${req.originalUrl} - ${nowDate.getFullYear()}-${nowDate.getMonth()+1}-${nowDate.getDay()+1} ${nowDate.getHours()}:${nowDate.getMinutes()}:${nowDate.getSeconds()}`);
    next();
};

app.use(cors());
app.use(requestMiddleware);
app.use(express.json());
app.use('/api', [articlesRouter]);

//------------------------------------------------------------
//  🧑🏻‍💻 라우터
//------------------------------------------------------------

app.get("/", (req, res)=>{
    res.send("index");
});


//------------------------------------------------------------
//  🏃‍♂️ RUN
//------------------------------------------------------------

app.listen(port, ()=> console.log(`🟢SERVER: ${port}로 서버 실행`));