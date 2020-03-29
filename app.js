var createError = require('http-errors');
var express = require('express');
var path = require('path');
//var cookieParser = require('cookie-parser');
var logger = require('morgan');
let multer=require('multer');
let cookieSession=require('cookie-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//创建web服务器
var app = express()

// 模板引擎设置
app.set('views', path.join(__dirname, 'views'));//指定要读取的ejs位置
app.set('view engine', 'ejs');//设置模板引擎用ejs



//中间件配置
app.use(logger('dev'));//日志

//中间件安装-设置body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//app.use(cookieParser());

//中间件安装-设置multer
//let upload=multer({dest:path.join(__dirname,'public','upload')})

//分发不同的目录
let storage=multer.diskStorage({
  destination:function(req,file,cb){
    if(req.url.indexOf('user')!=-1 || req.url.indexOf('reg')!=-1){
      cb(null,path.join(__dirname,'public','upload','user'))
    }else if(req.url.indexOf('banner')!=-1){
      cb(null,path.join(__dirname,'public','upload','banner'))
    }else{
      cb(null,path.join(__dirname,'public','upload','product'))
    }
  }
})
let upload=multer({storage})
app.use(upload.any())//允许删除图片

//中间件安装-设置cookie-session
app.use(cookieSession({
  name:'nz1909',
  keys:['aa','bb'],
  maxAge:1000*60*60*24  //保留cookie的时间
}))

//多资源托管
app.use(express.static(path.join(__dirname,'public','template')));
app.use('/admin',express.static(path.join(__dirname,'public','admin')))// /admin是别名，用来区分走到哪一个分支
app.use(express.static(path.join(__dirname, 'public')));


//接口响应-用户端
app.all('/api/*',require('./routes/api/params'))//处理api下发的所有接口的公共参数

app.use('/api/reg',require('./routes/api/reg'))
app.use('/api/goods',require('./routes/api/goods'))
app.use('/api/login',require('./routes/api/login'))
app.use('/api/user',require('./routes/api/user'))
app.use('/api/logout',require('./routes/api/logout'))
app.use('/api/home',require('./routes/api/home'))
app.use('/api/follow',require('./routes/api/follow'))
app.use('/api/column',require('./routes/api/column'))
// app.use('/api/banner',require('./routes/api/banner'))

//接口响应-管理端
app.use('/admin/banner',require('./routes/admin/banner'))
//接口响应-代理端

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// 处理不存在的错误接口
app.use(function(req, res, next) {
  next(createError(404));
});

// 404错误处理函数
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // r// 利用ejs渲染一个ejs模板
  res.status(err.status || 500);

  if(req.url.includes('/api')){//用户端接口不存在返回{err:1,msg:'不存在的接口'}
    res.send({err:1,msg:'不存在的接口'})
  }else if(req.url.includes('/admin')){//管理端接口不存在返回{error.ejs}
    res.render('error');
  }else{// 资源托管没有对应的页面 返回 404.html
    res.sendFile(path.join(__dirname,'public','template','404.html'))
  }
  // res.render('error');
});

module.exports = app;
