var express = require("express");
var router = express.Router();
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({
  extended: false
});

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", router);

const request = require("request");

// Send http request async
function open(opts) {
  return new Promise(function(resolve, reject) {
    request(opts, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(body);
      } else {
        reject();
      }
    });
  });
}

router.get(
  "/",
  (req, res, next) => {
    
    //获取openid并返回
    console.log(req.body);
    let r1 = " ";
    let appId = "wxdf4236783aec3090";
    let secret = "9cfaa5e0f39a51f480f20b72c402b599";
    let js_code = req.query.code;

    let encryptedData = req.body.encryptedData;
    let iv = req.body.iv;
    let sessionKey = " ";
    let opts = {
      url: `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${js_code}&grant_type=authorization_code`
    };

    open(opts).then(function(value) {
      value = JSON.parse(value);
      console.log(value)
      // value: information from WeChat
      // https://developers.weixin.qq.com/miniprogram/dev/api-backend/auth.code2Session.html
      // openid	string	用户唯一标识
      // session_key	string	会话密钥
      // unionid	string	用户在开放平台的唯一标识符，在满足 UnionID 下发条件的情况下会返回，详见 UnionID 机制说明。
      // errcode	number	错误码
      // errmsg	string	错误信息

      var mysql = require("mysql");
      var connection = mysql.createConnection({
        host: process.env.HOST,
        port: "3306",
        database: "rideshare",
        multipleStatements: true,
        user: process.env.USER,
        password: process.env.PASSWORD
      });

      connection.connect(function(err) {
        if (err) console.log("与MySQL数据库建立连接失败。");
        else {
          console.log("与MySQL数据库建立连接成功。");

          // Check whether this user already exist
          connection.query(
            "SELECT * FROM user_info WHERE wechat_openid=?;",
            [value.openid],
            function(err, data) {
              if (err) {
                console.log("查询数据失败");
                res.status(500).send("查询数据失败");
              } else {
                console.log(data);

                // If not exist, create user
                if (data.length == 0) {

                  connection.query(
                    "INSERT INTO user_info (wechat_openid) VALUES(?);",
                    [value.openid],

                    function(err, data) {
                      if (err) {
                        console.log(err);
                        console.log("插入数据失败");
                        res.status(500).send("插入数据失败");
                      } else {
                        if (data.length == 0) {
                          console.log("插入数据失败");
                        } else {
                          console.log(data);
                          console.log("插入数据成功");

                          connection.query(
                            "SELECT * FROM user_info WHERE wechat_openid=?;",
                            [value.openid],
                            function(err, data) {
                              if (err) {
                                console.log(err);
                                console.log("插入数据失败");
                                res.status(500).send("插入数据失败");
                              } else {
                                res.status(200).send(data[0]);
                              }
                            }
                          );
                        }
                      }
                    }
                  );
                } else {
                  res.status(200).send({
                    user_id: data[0].user_id
                  });
                }

                connection.end();
              }
            }
          );
        }
      });
    });
  },
  function(error) {
    console.log(error);
  }
);


module.exports = app;
