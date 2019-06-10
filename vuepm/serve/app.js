var express=require("express");
var app=express();
var hostname="0.0.0.0";
var port=1901;
var http=require("http");
var server=http.createServer(app);
app.get("/",(req,res)=>{
    res.send("数据接口")
})

app.use(express.json());
app.use(express.urlencoded({extended:false}));
// app.use(express.static(path.join(__dirname, 'public')));//static 静态文件   根 


var session=require("express-session");
app.use(session({
    secret:"keyboard cat",
    name:"appTest",
    cookie:{maxAge:60*60*1000},
    resave:false,
    saveUninitialized:true
}))

var {login}=require("./utils/index");
app.use(login);



var vue=require("./vue");
app.use("/vue",vue)

server.listen(port,hostname,()=>{
    console.log(`http://${hostname}:${port}`)
})