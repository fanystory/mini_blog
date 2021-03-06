//------------------------------------------------------------
//  π μν μμ­
//------------------------------------------------------------
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

const connect = require('./schemas/');
connect();

const articlesRouter = require("./routes/articles");
const userRouter = require("./routes/user")

//------------------------------------------------------------
//  π§π»βπ» λ―Έλ€μ¨μ΄
//------------------------------------------------------------

const requestMiddleware = (req, res, next) => {
    const nowDate = new Date();
    console.log(`π CLIENT: ${req.originalUrl} - ${nowDate.getFullYear()}-${nowDate.getMonth()+1}-${nowDate.getDay()+1} ${nowDate.getHours()}:${nowDate.getMinutes()}:${nowDate.getSeconds()}`);
    next();
};

app.use(express.static('static'));
app.use(express.urlencoded());

app.use(cors());
app.use(requestMiddleware);
app.use(express.json());
app.use('/api', [articlesRouter, userRouter]);

//------------------------------------------------------------
//  π§π»βπ» λΌμ°ν°
//------------------------------------------------------------

app.get("/", (req, res)=>{
    res.send("index");
});

app.get("/login", (req, res)=>{
    res.sendFile(__dirname + "/static/login.html");
});

app.get("/signin", (req, res)=>{
    res.sendFile(__dirname + "/static/signin.html");
});


//------------------------------------------------------------
//  πββοΈ RUN
//------------------------------------------------------------

app.listen(port, ()=> console.log(`π’SERVER: ${port}λ‘ μλ² μ€ν`));