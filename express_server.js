const { response } = require("express");
const express =require("express"); 
const app = express(); 
const bodyParser = require("body-parser") ; 
const PORT = 8080; 
const cookieParser = require("cookie-parser");

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

// add new link to the index 

app.get("/urls/new", (req, res) => {
  const templateVars = {username : req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.post("/urls" , (req,res)=>{
  if (req.body.newLongURL === undefined) {
    urlDatabase[generateRandomString()] = req.body.longURL;
    res.redirect("/urls");
}})

//url page information 
app.get ("/urls", (req,res) =>{
  let  username = null; 
  if(req.cookies.username) {username = req.cookies.username; }
  const templateVars = {urls : urlDatabase, username};
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
  const username = req.cookies[username];
  const templateVars={shortURL:sURL, longURL:lURL , username}
  if (lURL){
    res.render("urls_show", templateVars); 
  } else {
    res.send("Did not find this Long URL");
  }
})

app.post("/urls/:shortURL", (req,res) => {
  console.log("cool");
  const username = null; 
  const sURL = req.params.shortURL; 
  const nlURL = req.body.newLongURL;
  urlDatabase[sURL] = nlURL; 
  res.redirect("/urls");
})

//login 
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
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