const { response } = require("express");
const express =require("express"); 
const app = express(); 
const PORT = 8080; 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.get("/hello", (req, res) => {
  // res.send("check yo!");
  // res.json(urlDatabase);
  res.send("<html><body>hello <b>world </b></body></html>\n")
})
app.listen(PORT, ()=>{
  console.log(`example app is listening on port ${PORT}`);
}) 