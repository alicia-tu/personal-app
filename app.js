/*
  app.js -- This creates an Express webserver
*/

// First we load in all of the packages we need for the server...
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const axios = require ('axios');
const layouts = require("express-ejs-layouts");
var debug = require("debug")("personalapp:server");

const mongoose = require( 'mongoose' );
//mongoose.connect( `mongodb+srv://${auth.atlasAuth.username}:${auth.atlasAuth.password}@cluster0-yjamu.mongodb.net/authdemo?retryWrites=true&w=majority`);
mongoose.connect( 'mongodb://localhost/authDemo');
//const mongoDB_URI = process.env.MONGODB_URI
//mongoose.connect(mongoDB_URI)

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!!!")
});

const User = require('./models/User');
const ClassList = require ('./models/ClassList')
const MajorList = require ('./models/MajorList')
const ClubList = require ('./models/ClubList')
const PostList = require('./models/PostList')

const authRouter = require('./routes/authentication');
const isLoggedIn = authRouter.isLoggedIn
const loggingRouter = require('./routes/logging');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');


// Now we create the server
const app = express();

app.use(cors());
app.use(layouts);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(authRouter)
app.use(loggingRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);


const myLogger = (req,res,next) => {
  console.log('inside a route!')
  next()
}

//app.use(bodyParser.urlencoded({ extended: false }));
// where we look at a request and process it!
// here we start handling routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/demo", (request, response) =>{
  response.render("demo")
});

app.get("/about", (request, response) => {
  response.render("about");
});

app.get ("/covid19", (request, response) => {
  response.render ("covid19");
})

app.get("/example", (req, res)=>{
  res.render("example")
})

app.get("/intro", (req, res) =>{
  res.render("intro")
})


app.post("/c19",
  async (req,res,next) => {
    try {
      const date = req.body.date
      const url = "https://covidtracking.com/api/v1/us/"+date+".json"
      const result = await axios.get(url)
      console.dir(result.data)
      console.log('')
      console.dir(result.data.date)
      res.locals.date = result.data.date
      res.locals.states = result.data.states
      res.locals.positive =result.data.positive
      res.locals.negative =result.data.negative
      res.locals.pending =result.data.pending
      res.locals.death = result.data.death
      res.locals.hospitalized =result.data.hospitalized
      res.locals.totalTestResults = result.data.totalTestResults
      res.render('covid19Data')
    } catch(error){
      next(error)
    }
})

app.post("/personal", (request,response) => {
  const birthyear = parseFloat(request.body.age)
  const currentAge = (2021-birthyear)
  response.locals.name = request.body.fullname
  response.locals.age = currentAge
  response.locals.school = request.body.school
  response.locals.animal = request.body.animal
  response.locals.bio = request.body.bio
  response.locals.home = request.body.home
  response.locals.color = request.body.color
  response.locals.url = request.body.url
  response.render ("personal")
})
// Here is where we will explore using forms!

app.get('/profile',
    isLoggedIn,
    (req,res) => {
      res.render('profile')
    })

app.get('/profiles',
    isLoggedIn,
      async (req,res,next) => {
        try {
          res.locals.profiles = await User.find({})
          res.render('profiles')
          }
        catch(e){
          next(e)
        }
      })

  app.get("/class", async (req,res,next) => {
    res.render('class')
  })

  app.post("/class",
  isLoggedIn,
  async (req,res,next) => {
    const className = req.body.className
    const credit = req.body.credit
    const classlist = new ClassList({
      userId:req.user._id,
      className: className,
      credit:credit
    })
    const result = await classlist.save()
    console.log('result=')
    console.dir(result)
    res.redirect('/showClass')
})

app.get('/showClass', isLoggedIn,
  async (req,res,next) => {
    res.locals.classlist = await ClassList.find({userId:req.user._id})
    console.log('classlist='+JSON.stringify(res.locals.classlist.length))
    res.render('showClass')
  })

app.get('/showClass', isLoggedIn,
  async (req, res, next) =>{
    res.locals.classlist = await ClassList.find({className:req.body.className})
  })

app.get('/allclass', isLoggedIn,
    async (req,res,next) => {
      res.locals.classlist = await ClassList.find({})
      console.log('classlist='+JSON.stringify(res.locals.classlist.length))
      res.render('showClass')
    })

app.get('/showClass/last/:N', isLoggedIn,
    async (req,res,next) => {
      const N = parseInt(req.params.N)
      const classlist = await Classlist.find({})
      res.locals.classlist = classlist.slice(0,N)
      console.log('classlist='+JSON.stringify(res.locals.classlist.length))
      res.render('showClass')
    })

app.get('/classlistremove/:classes_id', isLoggedIn,
  async (req,res,next) => {
    const classes_id = req.params.classes_id
    console.log(`id=${classes_id}`)
    await ClassList.deleteOne({_id:classes_id})
    res.redirect('/showClass')

  })

app.get('/majorremove',
  isLoggedIn,
  async(req, res, next) =>{
    await MajorList.deleteOne({})
    res.redirect('/majors')
})

app.get('/postremove',
  async (req, res, next) =>{
    await PostList.deleteOne({})
    res.redirect('/posts')
  })

app.post('/majors',
  isLoggedIn,
  async(req, res, next) =>{
    const majorName = req.body.majorName
    const majorType = req.body.majorType
    const createdAt = req.body.createdAt
    const majorlist = new MajorList ({
      userId:req.user._id,
      createdAt: createdAt,
      majorType: majorType,
      majorName: majorName
    })
    const result = await majorlist.save()
    console.log ('result =')
    console.dir (result)
    res.redirect ('/majors')
  })

  app.get('/majors',
    isLoggedIn,
    async(req, res, next) =>{
      res.locals.majors = await MajorList.find({})
      res.render ('majors')
    })

  app.get("/posts",
    async(req, res, next) =>{
      res.locals.posttexts = await PostList.find({})
      res.render("posts")
    })

  app.post('/clubs',
  isLoggedIn,
  async(req, res, next) =>{
    const clubName = req.body.clubName
    const clubType = req.body.clubType
    const createdAt = req.body.createdAt
    const clubList = new ClubList({
      userId: req.user._id,
      createdAt: createdAt,
      clubType: clubType,
      clubName: clubName
    })
    const result = await clubList.save()
    console.log('result =')
    console.dir(result)
    res.redirect('/clubs')
  })

  app.post('/posts',
  async(req, res, next) =>{
    const name = req.body.name
    const postText = req.body.postText
    const postList = new PostList({
      name: name,
      postText: postText
    })
    const result = await postList.save()
    console.log('result =')
    console.dir(result)
    res.redirect('/posts')
  })

  app.get('/clubs',
  isLoggedIn,
  async(req, res, next) =>{
    res.locals.clubs = await ClubList.find({})
    res.render('clubs')
  })

// Don't change anything below here ...

// here we catch 404 errors and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// this processes any errors generated by the previous routes
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

//Here we set the port to use
const port = "5000";
app.set("port", port);

// and now we startup the server listening on that port
const http = require("http");
const server = http.createServer(app);

server.listen(port);

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

server.on("error", onError);

server.on("listening", onListening);

module.exports = app;
