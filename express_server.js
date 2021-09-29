const { response } = require("express");
const express =require("express"); 
const app = express(); 
const bodyParser = require("body-parser") ; 
const PORT = 8080; 

app.set("view engine", "ejs");

// generate random string 

function generateRandomString() {
  return (Math.random()+1).toString(36).substring(6);
}

app.use(express.urlencoded({extended:true}));

// database 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// add new link to the index 

app.post("/urls" , (req,res)=>{
  if (req.body.newLongURL === undefined) {
    urlDatabase[generateRandomString()] = req.body.longURL;
    res.redirect("/urls");
} 
})

//url page information 
app.get ("/urls", (req,res) =>{ 
  const templateVars = {urls : urlDatabase};
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
  const templateVars={shortURL:sURL, longURL:lURL}
  if (lURL){
    res.render("urls_show", templateVars); 
  } else {
    res.send("Did not find this Long URL");
  }
})

app.post("/urls/:shortURL", (req,res) => {
  console.log("cool");
  const sURL = req.params.shortURL; 
  const nlURL = req.body.newLongURL;
  urlDatabase[sURL] = nlURL; 
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