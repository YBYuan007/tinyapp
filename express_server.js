const { response } = require("express");
const express =require("express"); 
const app = express(); 
const bodyParser = require("body-parser") ; 
const PORT = 8080; 
const cookieParser = require("cookie-parser");
// const uuid = require('uuid/v4');

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));

// generate random string 

function generateRandomString() {
  return (Math.random()+1).toString(36).substring(6);
}

// database 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

let  users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const createUser = function ( email, password, users) {
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email,
    password,
  };
  return userId;
};

const findUserByEmail = function (email, users) {
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      return user;
    }
  }
  return false;
};

const authenticateUser = function (email, password, users) {
  const userFound = findUserByEmail(email, users);
  if (userFound && userFound.password === password) {
    return userFound;
  }
  return false;
};

// add new link to the index 

app.get("/urls/new", (req, res) => {
  // const email = users[userId].email; 
  const templateVars = {user: users[req.cookies['user_id']]};
  res.render("urls_new", templateVars);
});

app.post("/urls" , (req,res)=>{
  if (req.body.newLongURL === undefined) {
    urlDatabase[generateRandomString()] = req.body.longURL;
    res.redirect("/urls");
}})

//url page information 
app.get ("/urls", (req,res) =>{ 
  console.log("main page");
  // const email = users.userId.email; 
  const templateVars = {urls: urlDatabase, user: users[req.cookies['user_id']]};
  res.render("urls_index", templateVars);
})

// shortern to /u/
app.get("/u/:shortURL", (req,res) => {
  // console.log(req.params); 
  const sURL = req.params.shortURL; 
  const lURL = urlDatabase[sURL];
  if (lURL){
  return res.redirect(lURL);
  } 
  return res.send("Did not find this short URL's corresponding long URL")
})

// individual page redirecting to the actual url 
app.get("/urls/:shortURL", (req,res) => {
  // console.log(req.params); 
  const sURL = req.params.shortURL; 
  const lURL = urlDatabase[sURL];
  // const email = users.userId.email; 
  const templateVars={
    shortURL:sURL, 
    longURL:lURL, 
    user: users[req.cookies['user_id']]
  }
  if (lURL){
    res.render("urls_show", templateVars); 
  } else {
    res.send("Did not find this Long URL");
  }
})

app.post("/urls/:shortURL", (req,res) => {
  const sURL = req.params.shortURL; 
  const nlURL = req.body.newLongURL;
  urlDatabase[sURL] = nlURL;  // response with userID 
  res.redirect("/urls");
})

// registration 

app.get("/register", (req,res) => { // user yell and they want something from me
  const templateVars = {user: users[req.cookies['user_id']]}; 
  res.render("url_register", templateVars)
})

app.post("/register", (req, res) =>{ // user send me something 
  console.log('req.body:', req.body);
  const email = req.body.email;
  const password = req.body.password;
  if (!password || !email) {
    res.status(401).send("please enter a valid password / email");
  }
  const userFound = findUserByEmail(email, users); 
  if(userFound) {
    res.status(400).send("sorry, that user already exists!") ; 
    return;
  }
  const userId= createUser(email, password, users); 
  res.cookie("user_id", userId); 
  res.redirect("/urls");
}) 

//login 
app.post("/login", (req, res) => {
  const userid = req.cookies.user_id;
  res.cookie('user_id', userid); //we response with the cookie which will stay with the user.
  res.redirect('/urls');
});

//logout
app.post("/logout", (req,res) => {
  res.clearCookie('username'); 
  res.redirect("/urls");
})

// delete from db 

app.post("/urls/:shortURL/delete", (req,res) => {
  // console.log(req.params); 
  const sURL = req.params.shortURL; 
  // console.log(sURL); 
  delete urlDatabase[sURL]; 
  // console.log(req.params);
  res.redirect("/urls")
})

app.listen(PORT, ()=>{
  console.log(`example app is listening on port ${PORT}`);
}) 