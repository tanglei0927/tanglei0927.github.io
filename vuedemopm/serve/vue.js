//路由
var express=require("express");
var router=express.Router();
var {conn}=require("./utils/db");
var {aesEncrypt,keys}=require("./utils/index")
var {ObjectId}=require("mongodb");

router.get("/",(req,res)=>{
    res.send("vue路由接口")
})

//login登录接口     使用邮箱，密码登录登录成功生成Token并传递给前端
//url:http://localhost:1901/vue/login
//methods:POST
//传值：email  password
//返回值  JSON   code  type msg token  username
router.post("/login",(req,res)=>{
    var body=req.body;
    console.log(body);
    conn((err,db)=>{
        if(err) throw err;
        db.collection("userinfo").find({email:body.email,password:body.password},{_id:0,username:1}).toArray((err,result)=>{
            if(err) throw err;
            console.log(result)
            console.log(!!result.length)
            if(result.length){
                // var token=aesEncrypt(body.email)
                var token=aesEncrypt(result[0].username+new Date().getTime(),keys)
                // console.log(result[0].username);
                req.session.token = token;
                req.session.email=body.email;
                console.log(req.session.email)
                res.json({
                    code:200,
                    msg:"登录成功",
                    type:1,
                    username:result[0].username,
                    token
                })
            }else{
                res.json({
                    code:401,
                    msg:"登录失败，用户名或密码不正确",
                    type:0
                })
            }
            db.close();
        })
    })
   
})

/**
 * 
 * 判断是否登录，已登录，返回username
 *传值：token
 * 
 */
router.get("/islogin",(req,res)=>{
    var query=req.query;
    console.log(query.token)
    var htToken=req.session.token;
    var email=req.session.email;
    console.log(email)
    console.log(htToken);
    if(htToken==query.token){
        conn((err,db)=>{
            if(err) throw err;
            db.collection("userinfo").find({email}).toArray((err,result)=>{
                if(err) throw err;
                console.log(result);
                res.json({
                    code:200,
                    msg:"已登录",
                    type:1,
                    username:result[0].username
                })
            })
        })
    }else{
        console.log("未登录")
        res.json({
            code:401,
            msg:"请登录",
            type:0
        })
    }
})
/**
 * 用户资料接口
 */
router.get("/userinfo",(req,res)=>{
    var email=req.session.email;
    conn((err,db)=>{
        if(err) throw err;
        db.collection("userinfo").find({email:email}).toArray((err,result)=>{
            if(err)throw err;
            console.log(result)
            console.log(!!result[0].sex)
            if(!!result[0].sex){
                // console.log("获取成功")
                var labels=[]
                if(!!result[0].label){
                    labels=result[0].label;
                }else{
                    labels=[];
                }
                res.json({
                    type:1,
                    // msg:"获取成功",
                    sex:result[0].sex,                    
                    state:result[0].state,
                    labels
                })
            }else{
                // console.log("暂无数据")
                res.json({
                    type:0,
                    msg:"暂无数据",
                    sex:"",
                    state:""
                })
            }
          db.close();  
        })
    })
})

/**
 * 修改用户资料接口
 * 
 */
router.get("/updateuser",(req,res)=>{
    var query=req.query;
    var email=req.session.email;
    console.log(query)
    if(req.session.email){
        conn((err,db)=>{
            if(err) throw err;
            db.collection("userinfo").update({email:email},{$set:query},(err,result)=>{
                if(err) throw err;
                if(result.result.ok>0){
                    res.json({
                        type:1,
                        msg:"修改成功"                        
                    })
                }else{
                    res.json({
                        type:2,
                        msg:"修改失败"                        
                    })
                }
            })
        })
  
    }else{
        console.log("未登录")
          res.json({
                    type:0,
                    msg:"登录信息已过期，请登录后再来"                        
                })
    }
})



 
//register  注册接口
//url:http://localhost:1901/vue/register
//methods:GET
//传值：query=>username,password,email,=>集合
//返回值：json   code type  msg
router.get("/register",(req,res)=>{
    var query=req.query;
    query=JSON.parse(query.userinfo);
    conn((err,db)=>{
        if(err)throw err;
        console.log(query)
        db.collection("userinfo").find({email:query.email}).count((err,result)=>{
            if(err)throw err;
            console.log("result:"+result)
            if(result==0){
                // console.log("成功")
                db.collection("userinfo").insert(query,(err,result)=>{
                    if(err)throw err;
                    console.log(result.result.ok);
                    if(result.result.ok>0){
                        let token=aesEncrypt(query.username+new Date().getTime(),keys);
                        req.session.token = token;
                        req.session.email=query.email;
                        console.log(req.session.email)
                        res.json({
                            code:200,
                            msg:"注册成功",
                            type:1,
                            token
                        })
                    }else{
                        res.json({
                            code:401,
                            msg:"注册失败",
                            type:0
                        })
                    }
                   db.close();
                })
            }else{
                res.json({
                    code:401,
                    msg:"邮箱已被注册",
                    type:0
                })
            }
            db.close();
        })
        
    })
   
})


/**
 *商品列表接口    goddslist
 * url:http://localhost:1901/vue/goodslist    GET
 *传值："category"   
 */
router.get("/goodslist",(req,res)=>{
    var query=req.query;
    // console.log(query)  
    // console.log("11111111111")  
    var hash={};
    if(!!query.hash){
        hash=JSON.parse(query.hash)
    }
    var limit={};
    if(!!query.query){
        limit=JSON.parse(query.query)
    }
    
    
    // console.log(hash)
    // console.log(limit)
    conn((err,db)=>{
        if(err) throw err;
        // console.log(query.limit)
        db.collection("goodsinfo").find(hash).limit(limit.limit*1).toArray((err,result)=>{
            if(err) throw err;
            if(result){
                // console.log(result)
                res.json({
                    code:"200",
                    type:1,
                    msg:"查询成功",
                    resultcount:result.length,
                    result
                })
            }else{
                res.json({
                    code:"401",
                    type:0,
                    msg:"查询失败",
                    resultcount:0
                })
            }
            db.close();
        })
    })

})

/**
 * 商品镶嵌式接口:  goodsinfo
 * url: http://localhost:1901/vue/goodsinfo
 */

 router.get("/goodsinfo",(req,res)=>{
     var query=req.query;
    //  console.log(query);
    conn((err,db)=>{
        if(err) throw err;
        db.collection("goodsinfo").find({_id:ObjectId(query.id)}).toArray((err,result)=>{
            if(err) throw err;
            if(!!result){
                res.json({
                    code:200,
                    type:1,
                    result
                })
            }else{
                res.json({
                    code:400,
                    type:0,
                    msg:"暂未查询到，去看看其他的吧"
                })
            }
        })
    })
     
 })

/**
 * 商品问题接口  wneti
 * url:http://localhost:1901/vue/wenti   GET
 * 传值：goodsid
 * 返值：goodsid（商品id） 提问人邮箱（temail）e用户名（tuname）  twmsg（提问内容）twtime  时间
 * 回答人（多人）=>数组+对象   回答人邮箱（hemail）用户名（huname）  hymsg（回应内容）hytime 回答时间
 */

 router.get("/wenti",(req,res)=>{
     var query=req.query;
     conn((err,db)=>{
         if(err) throw err;
         console.log("query")
         console.log(query)
         db.collection("wentiinfo").find(query).toArray((err,result)=>{
            if(err) throw err;
            if(!!result){
                res.json({
                    code:200,
                    type:1,
                    result
                })
            }else{
                res.json({
                    code:400,
                    type:0
                })
            }
         })
     })
     
 })

 /**
  * 赞接口   查询  myzan
  * email后台    goodsid（传过来）
  * 
  */
 router.get("/zan",(req,res)=>{
     var query=req.query;
     console.log(query)
     var email=req.session.email;
     console.log(email)
     conn((err,db)=>{
         if(err) throw err;
         db.collection("zan").find({email:email,goodsid:query.goodsid}).toArray((err,result)=>{
             if(err) throw err;
             console.log(result)
             res.json({
                 code:200,
                 type:1,
                 count:result.length,
                 result
             })
         })
     }) 
 })
/**
 * 个人赞    myzan
 * 
 * 
 */

 router.get("/myzan",(req,res)=>{
     var email=req.session.email;
     if(!!email){
        conn((err,db)=>{
            if(err) throw err;
            db.collection("zan").find({email:email}).toArray((err,result)=>{
                if(err) throw err;
                console.log(result)
                res.json({
                    code:200,
                    type:1,
                    count:result.length,
                    result
                })
            })
        })   
     }else{
        res.json({
            code:400,
            type:0,
            msg:"登录信息失效，请重新登录"
        })
     }
 })





/**
 * 修改赞接口  修改goods表的收藏人数   收藏表的情况
 * updatezan    email(后台) goodsid    操作状态： 删除  添加
 */
router.get("/updatezan",(req,res)=>{
    var query=req.query;
    console.log(query)
    var email=req.session.email;
    // if(query.opra=="true"){
        //收藏   goodsinfo 中对应商品的收藏量+1   当前是用户的该商品  添加收藏信息
        conn((err,db)=>{
            if(err)throw err;
            db.collection("goodsinfo").update({_id:ObjectId(query.goodsid)},{$set:{collected_num:query.zanCount*1+1}},(err,result)=>{
                if(err) throw err;
                if(result.result.ok==1){
                    //商品表更改成功 zan表添加
                    db.collection("zan").insert({email:email,goodsid:query.goodsid,goodsname:query.goodsname,goodsimg:query.goodsimg},(err,result)=>{
                        if(err) throw err;
                        console.log(result.result.ok)
                        if(result.result.ok==1){
                            res.json({
                                code:200,
                                type:1,
                                msg:"收藏成功"
                            })
                        }
                         db.close();
                    })
                }
               
            })
           
        })
  


})


/**
 * 删除  取消收藏接口
 * 
 * 
 */
router.get("/removezan",(req,res)=>{
    var query=req.query;
    console.log(query)
    var email=req.session.email;
    if(query.opra=="false"){
        //收藏   goodsinfo 中对应商品的收藏量+1   当前是用户的该商品  添加收藏信息
        conn((err,db)=>{
            if(err)throw err;
        // 取消  goodsinfo 中对应商品的点赞量-1   当前是用户的该商品赞取消
        conn((err,db)=>{
            if(err)throw err;
            db.collection("goodsinfo").update({_id:ObjectId(query.goodsid)},{$set:{collected_num:query.zanCount*1-1}},(err,result)=>{
                if(err) throw err;
                if(result.result.ok>=1){
                    //商品表更改成功 zan表查找并删除
                    db.collection("zan").remove({email:email,goodsid:query.goodsid},(err,result)=>{
                        if(err) throw err;
                        // console.log(result)
                        console.log(result.result.ok)
                        if(result.result.ok==1){
                            res.json({
                                code:200,
                                type:1,
                                msg:"取消成功"
                            })
                        }
                        db.close();
                    })
                }
            })
        })
    })
}

})


/**
 * 添加订单  接口  
 * dindan
 */
router.get("/dindan",(req,res)=>{
    var query= req.query;
    console.log(query)
    var dindaninfo=query.dindaninfo;
    dindaninfo=JSON.parse(dindaninfo)
    dindaninfo.email=req.session.email;
    conn((err,db)=>{
        if(err)throw err;
        db.collection("dindan").insert(dindaninfo,(err,result)=>{
            if(err)throw err;
            // console.log(result.result.ok);
            if(result.result.ok==1){
                res.json({
                    code:200,
                    type:1,
                    msg:"提交成功"
                })
            }else{
                res.json({
                    code:400,
                    type:0,
                    msg:"提交失败"
                })
            }
        })
    })
   
})

/**
 * 查看我的订单信息
 * mydindan
 * 
 */
router.get("/mydindan",(req,res)=>{
    var email=req.session.email;
    conn((err,db)=>{
        if(err)throw err;
        db.collection("dindan").find({email:email}).toArray((err,result)=>{
            if(err)throw err;
            if(result.length>0){
                res.json({
                    code:200,
                    type:1,
                    result
                })
            }else{
                res.json({
                    code:400,
                    type:0
                })
            }
        })
    })
})
/**
 * 取消预订  
 * removedindan
 */

 router.get("/removedindan",(req,res)=>{
     var query=req.query;
     console.log(query);
     var email=req.session.email
     conn((err,db)=>{
         if(err)throw err;
         db.collection("dindan").remove({email:email,_id:ObjectId(query.id)},(err,result)=>{
             if(err) throw err;
            console.log(result.result.ok)
            if(result.result.ok>0){
                res.json({
                    code:200,
                    type:1,
                    msg:"取消成功"
                })
            }else{
                res.json({
                    code:401,
                    type:0,
                    msg:"取消失败"
                })
            }
         })
     })
 })

/**
 * 搜索接口 search
 *
 */
router.get("/search",(req,res)=>{
  var query=req.query;
    searchinfo=query.searchinfo;
  console.log(query.searchinfo)
    conn((err,db)=>{
        if(err) throw err;
        var keyword=new RegExp(searchinfo);
        db.collection("goodsinfo").find({$or:[{category:keyword},{title:keyword}]}).toArray((err,result)=>{
            if(err) throw err;
            // console.log(result);
            if(result.length>0){
                res.json({
                    code:200,
                    type:1,
                    msg:"查询成功",
                    result
                })
            }else{
                res.json({
                    code:401,
                    type:0,
                    msg:"暂无数据"
                })
            }
        })
    })
    
})



module.exports=router;