var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.route("/login").get(function (req, res) {
    res.render("login", {title: "User Login"});
}).post(function (req, res) {
    var User = global.dbHandel.getModel('user');
    var uName = req.body.uname;
    User.findOne({name: uName}, function (err, doc) {
        if (err) {
            res.send(500);
            console.log("error");
        } else if (!doc) {
            req.session.error = '用户名不存在!';
            res.send(404);
        } else {
            if (req.body.upwd != doc.password) {
                req.session.error = '密码错误!';
                res.send(404);
            } else {
                req.session.user = doc;
                res.send(200);
            }
        }
    });
});

/* GET register page. */
router.route("/register").get(function (req, res) {    // 到达此路径则渲染register文件，并传出title值供 register.html使用
    res.render("register", {title: 'User register'});
}).post(function (req, res) {
    //这里的User就是从model中获取user对象，通过global.dbHandel全局方法（这个方法在app.js中已经实现)
    var User = global.dbHandel.getModel('user');
    var uname = req.body.uname;
    var upwd = req.body.upwd;
    User.findOne({name: uname}, function (err, doc) {   // 同理 /login 路径的处理方式
        if (err) {
            res.send(500);
            req.session.error = '网络异常错误！';
            console.log(err);
        } else if (doc) {
            req.session.error = '用户名已存在！';
            res.send(500);
        } else {
            User.create({                             // 创建一组user对象置入model
                name: uname,
                password: upwd
            }, function (err, doc) {
                if (err) {
                    res.send(500);
                    console.log(err);
                } else {
                    req.session.error = '用户名创建成功！';
                    res.send(200);
                }
            });
        }
    });
});

/* GET home page. */
router.get("/home", function (req, res) {
    if (!req.session.user) {                     //到达/home路径首先判断是否已经登录
        req.session.error = "请先登录"
        res.redirect("/login");                //未登录则重定向到 /login 路径
    }
    res.render("home", {title: 'Home'});         //已登录则渲染home页面
});

/* GET logout page. */
router.get("/logout", function (req, res) {    // 到达 /logout 路径则登出， session中user,error对象置空，并重定向到根路径
    req.session.user = null;
    req.session.error = null;
    res.redirect("/");
});

var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/images');
    },
    filename: function (req, file, cb) {
        var fileFormat = file.originalname.split(".");
        cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
});

// var multerConfig = {
//     dest: './public/images', // Normal file upload destination path
//     limits: {
//         fileSize: 10*1024*1024 // Max file size in bytes (10 MB)
//     },
//     filename:function(req,res,cb){
//         var fileFormat = (file.originalname).split(".");
//         cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
//     },
//     fileFilter: function (req, file, cb) {
//         var mimetypes = (['text/*', 'image/*', 'video/*', 'audio/*', 'application/zip']).join(',');
//         var testItems = file.mimetype.split('/');
//         if ((new RegExp('\\b' + testItems[0] + '/\\*', 'i')).test(mimetypes) || (new RegExp('\\*/' + testItems[1] + '\\b', 'i')).test(mimetypes) || (new RegExp('\\b' + testItems[0] + '/' + testItems[1] + '\\b', 'i')).test(mimetypes)) {
//             cb(null, true);
//         } else {
//             return cb(new Error('Only image, plain text, audio, video and zip format files are allowed!'), false);
//         }
//     } // fileFilter要在这里声明才行，用instance.fileFilter = funciton(){};是不管用的
// };


var storage = multer.diskStorage({
    //设置上传后文件路径，uploads文件夹会自动创建。
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    //给上传文件重命名，获取添加后缀名
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
});
//添加配置文件到muler对象。
var upload = multer({
    storage: storage
});


//var upload = multer(multerConfig);
router.post("/file-upload", upload.single("uploadedFile"), function (req, res) {
    var fs = require("fs");
    var file = req.file;
    //不完善，记得删除原始临时文件
    res.send("is that success?")
});


module.exports = router;
