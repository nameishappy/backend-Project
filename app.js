
require('dotenv').config();
const express = require("express");

const bodyParser = require("body-parser");
const ejs = require("ejs");
var request = require("request");
const _ = require('lodash');
const saltRounds=10;
const session = require('express-session');
const passport=require("passport");
const passpLocalMongoose=require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose=require("mongoose");
const { post } = require("request");
const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const URL=process.env.PORT || 3000
app.use(session({
  secret: 'Our Little Secreat ',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb+srv://prasugupta000000216:23456Ram@cluster0.wwy8zyp.mongodb.net/blogDB");


const postSchema=({
 title:String,
  content:String
});
const userSchema=new mongoose.Schema({
  email:{
    type:String,
   
   },
 password:String,
  googleId:String
  
  
});
const Post=mongoose.model("Post",postSchema);
const contactSchema = {
  fname:String,
  lname:String,
  email:String,
  phone:String,
  message:String
};
const Contact=mongoose.model("Contact",contactSchema);


userSchema.plugin(passpLocalMongoose);
// userSchema.plugin(encrypt,{secret:process.env.API_KEY,encryptedFields: ['password']});
userSchema.plugin(findOrCreate);
const User=mongoose.model("User",userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

passport.use(new GoogleStrategy({
  clientID:process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "https://erin-jittery-kitten.cyclic.app/auth/google/home",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));
const homeStartingContent = "The most widely used source for information gathering and sharing is Internet. Any opinion or fact on any subject is very likely to be found in internet today. The most effective way to share your knowledge is to write articles and post them in different web-blogs.  There are some benefits for writing and sharing articles. One of the most prominent of article writing is to learn and gain knowledge from others experience. This is actual reason for which articles are written and studied. Writing articles enable to produce information to potential audience all across the world and is considered important as readers can accurately relate their experience and opinion with content of these articles. Another benefit that a writer can have from writing article is that they will be able to establish themselves, their websites or company profile effectively. Valuable information sharing for individual or business purpose helps audience all over the world to recognize the publisher which helps in growing a trust of knowledge or service provided by these publishers of article.";

const aboutContent = " I spend a lot of time worldwide blogging and writing scripts. I enjoy going on vacation, reading, and doing extensive study for new site designs. This website was created to compile the most recent and innovative blogger templates created by various developers worldwide. We posted each design to the greatest selection of blogger template directories since they are all distinctive and adaptable. We appreciate your visit and support. To stay in contact with us and view additional site designs,";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";













app.get("/home",function(req,res){

    Post.find({}).exec().then(postarray=>{
    

      res.render("home",{para1:homeStartingContent,postArr:postarray});
    })
  
  
  


});
  // res.render("home",{para1:homeStartingContent,postArr:postArray});
  



app.get("/",(req,res)=>{

  res.render("home1");
});
app.get("/login",(req,res)=>{

  res.render("login");
});
app.get("/register",(req,res)=>{

  res.render("register");
});
app.post("/contact",function(req,res){
  const contact1=new Contact({
    fname:req.body.fname,
    lname:req.body.lname,
    email:req.body.email,
    phone:req.body.phone,
    message:req.body.msg
    });
    contact1.save().then(()=>{
      
       res.send("Yourquery has been submitted ");
      }
      
    ).catch(err=>{
      console.log(err);
    })
  });
 
app.get("/about",function(req,res){
 res.render("about",{para2:aboutContent});
});
app.get("/contact",function(req,res){
 res.render("contact",{para3:contactContent});
});
app.get("/compose",function(req,res){
  
 res.render("compose");
});


app.get("/postarray/:topic",function(req,res){
//  for(var i=0;i<postArray.length;i++){

//   if(req.params.topic===postArray[i].title){
//   console.log("Match Found!");

//  }
// }
// postArray.forEach(function(e){
//   let comp1=_.lowerCase(req.params.topic);
//   let comp2=_.lowerCase(e.title);
 
//   if(comp1===comp2){

//    res.render("post",{PostTitle:e.title,PostBody:e.content});
//   }
// });
const requestPostId=req.params.topic;
Post.findOne({_id:requestPostId}).then(post=>{
   res.render("post",{PostTitle:post.title,PostBody:post.content});

});
});
app.post("/register",(req,res)=>{


User.register({username:req.body.username},req.body.password,function(err,user){
if(err){
  console.log("Error in register page");
  res.redirect("/register");
}
else{
  passport.authenticate("local")(req,res,function(){
    res.redirect("/login");
  });
}
});

});
app.get("/auth/google",
  passport.authenticate('google', { scope: ["email","profile"] })
);
app.get("/auth/google/home", 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
  });
  
app.post("/login",(req,res)=>{
 
  const user=new User({
      username:req.body.username,
      password:req.body.password
  });
  req.login(user,(err)=>{
      if(err){
          console.log(err);
      }
      else{
          passport.authenticate("local")(req,res,()=>{
              res.redirect("/home");
          });
      }
  });
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/login");
});
app.post("/compose",function(req,res){
//   const post={
//     title:req.body.postTitle,
//     postbody:req.body.postBody

//   };

const post=new Post({
  title:req.body.postTitle,
  content:req.body.postBody
});
post.save().then(()=>{
  res.redirect("/home");
});

// postArray.push(post);


});










app.post("/home",function(req,res){
res.redirect("/compose");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
