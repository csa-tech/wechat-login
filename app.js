
var express = require('express');
var router = express.Router();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({
    extended: false
});


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/pageview', pageview);

app.use('/test', router)

const request = require("request");
const use = {};
use.open = function (opts) {
    return new Promise(function (resolve, reject) {
        request(opts, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            } else {
                reject();
            }
        })
    });
}
//module.exports = use;

//路由
// router.get('/', urlencodedParser, (req, res) => {
//         //拿到前台给的code后，发送请求
//     if(req.body.code) {
//         let options = {
//             method: 'GET',
//             url: 'https://api.weixin.qq.com/sns/jscode2session?',
//             formData: {
//             //     appid:wxdf4236783aec3090,
//             //     //secret: 9cfaa5e0f39a51f480f20b72c402b599,
//             //     js_code: req.body.code,
//             //     grant_type: 'authorization_code'
//                 UserImgUrl: "jimeone",
//                 carImgUrl: "jimeone",
//                 name: "jimeone",
//                 carType: "jimeone",
//                 carLicense: "jimeone",
//                 carColor: "jimeone"
//             }
//         }
//     }        
// })
router.get('/', (req, res, next) => {
    //获取openid并返回
    //router.login = function (req, res) {
//    console.log(req)
    let r1 = ' ';
    let appId = 'wxdf4236783aec3090';
    let secret = '9cfaa5e0f39a51f480f20b72c402b599';
    let js_code = req.query.code;
    
    
    let encryptedData = req.body.encryptedData;
    let iv = req.body.iv;
    let sessionKey = ' ';
    let opts = {
        url: `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${js_code}&grant_type=authorization_code`

    }
    use.open(opts).then(function (value) {
        
        value = JSON.parse(value)
        
        var mysql = require('mysql');
    var connection = mysql.createConnection({
        host     : 'mydatabase.c9ukuxyqda4n.us-west-1.rds.amazonaws.com',
        port     : '3306',
        database : 'rideshare',
        multipleStatements: true,
        user     : 'CSAUser',
        password : 'Csa666!!',
    });

    connection.connect(function(err) {
        console.log(value)
        if(err) console.log('与MySQL数据库建立连接失败。');
        else{
            console.log('与MySQL数据库建立连接成功。');
            connection.query('SELECT * FROM user_info WHERE wechat_openid=\''+value.openid+'\'',function(err,data) {               //wechat_openid 记得修改
                           if(err) {
                               console.log('查询数据失败');
                               res.status(404).send('查询数据失败');
                               
                           } else {
                               console.log(data)
                               if(data.length==0){
                                   var time = Date.now();
                                   var add = 'INSERT INTO user_info(wechat_openid,user_id) VALUES(\''+value.openid+'\',' +time+ ')';     //暂时是undefined 还没收到后端 ' +req.body.code + '
                                  
                                   
                                   connection.query(add,function(er,result) {
                                        if(er){
                                                console.log(er);
                                                console.log('插入数据失败');
                                                res.status(404).send('插入数据失败');
                                        } else {
                                                    if(result.length==0){
                                       console.log('插入数据失败');
                                   } else {
                                       console.log(result)
                                       console.log('插入数据成功');
                                    
                                       res.status(200).send({
                                           user_id:time,
                                       });
                                       
                                   }
                                        }
                                                    })
                               }
                                                    
                              // res.status(200).send('已存在');
                               connection.end() ;

                           }
                     })
                 }
    });
})
    }, function (error) {
        console.log(error)
    });
    
    
        
        
        
    //连接数据库并查找是否存在
    


app.use('/testpath', router)

module.exports = app;