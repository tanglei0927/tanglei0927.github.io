
/*
*** 加密 模块 crypto  Node 

*/ 


var crypto = require("crypto"); // node 模块 

// 加密函数
function aesEncrypt(data, key) {
    const cipher = crypto.createCipher('aes192', key);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

// 解密 
function aesDecrypt(encrypted, key) {
    const decipher = crypto.createDecipher('aes192', key);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
const keys = "wuhan1901";
// daydayup   daydayup+wuhan1807
exports.aesEncrypt = aesEncrypt;   // 加密
exports.aesDecrypt = aesDecrypt;   // 解密
exports.keys = keys;        // 密钥 



/*
***  数据库错误  500 
**   返回结果给前端
*/ 

exports.setError = function(err,res,db){
    if(err){
        res.json({
            statusCode:500,
            msg:"数据库错误",
            err
        })
        db.close();
        throw err;
    }
}

/**
 * 
 * 登陆
 *  
 * 
 * 
*/
exports.login=function(req,res,next){
    next();
}


 

/*
***  判断用户是否登录  500    登录=》进入下一步
**   前端请求数据时进行判断，获取前端带过来的请求头Token
**  登录页面，列表页面，数据详情  页面  跳过token验证  购买、查看个人信息需验证
**  后端没有token    表示登录信息失效 ===>未登录
**  前端没有   后端有  =》未登录
**  前端token：qToken   后台token:hToken
*/ 
exports.checkIsLogin = function(req,res,next){
    // var token = req.session.token;
    var pathStr=req.path;
    if(pathStr!="/vue/login" && pathStr!="/vue/goods"){//
        //需要验证
        
        const qToken=req.headers.token;
        // console.log(qToken)
        if(qToken){//前端有token
            const hToken=req.session.token;
            if(hToken){//后端有，判断是否一致
                if(qToken==hToken){
                    next()
                }else{
                    res.json({
                        code:401,
                        msg:"请重新登录",
                        type:0
                    })
                }
            }else{
                res.json({
                        code:401,
                        msg:"登录信息过期，请重新登录",
                        type:0
                    })
                }
            
        }else{
            res.json({
                code:401,
                msg:"请登录",
                type:0
            })
        }
        
    }else{//不需要验证
        next()
    }
}

/*
***  获取解密的用户名 
**   
*/ 
exports.username = function(req){
    return aesDecrypt(req.session.token,keys)
}


exports.dateFormat = function(time){
    var date = new Date(time);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;

}