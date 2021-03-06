const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const {getUserByEmail} = require('./helpers');

const PORT = 8080;
const salt = bcrypt.genSaltSync(10);
const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["Some way to encrypt the values", "$!~`yEs123bla!!%"],
  })
);

// generate random string
function generateRandomString() {
  return (Math.random() + 1).toString(36).substring(6);
}

// database - url
let urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

//function - encrypt password 
const hashPW = function(userPW) {
  return bcrypt.hashSync(userPW, salt);
};

// database - user
let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: hashPW("purple-monkey-dinosaur")
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: hashPW("dishwasher-funk")
  }
};

const createUser = function(email, password, users) {
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email,
    password: hashPW(password)
  };
  return userId;
};

const authenticateUser = function(email, password, users) {
  const userFound = getUserByEmail(email, users);
  if (userFound && bcrypt.compareSync(password, userFound.password)) {
    return userFound;
  }
  return false;
};

const urlsForUser = function(id) {
  let user_url = {};
  for (let urldb in urlDatabase) {
    if (urlDatabase[urldb].userID === id) {
      user_url[urldb] = {
        "shortURL": urldb,
        "longURL": urlDatabase[urldb].longURL,
        "id": id};
    }
  }
  return user_url;
};

// "/" page information 
app.get("/", (req, res) => {
  if (users[req.session.ID]) {
    res.redirect("/urls"); 
  } else {
    res.redirect("/login");
  }
}); 

// add new url link
app.get("/urls/new", (req, res) => {
  if (users[req.session.ID]) {
    const templateVars = {
      user: users[req.session.ID],
      email: users[req.session.ID].email
    };
    res.render("urls_new", templateVars);
  } else {
    return res.status(404).send("You need to login to shortern the URL.");
  }
});

app.post("/urls" , (req,res)=>{
  if (!users[req.session.ID]) {
    return res.send("you need to login to your account first.");
  } else if (req.body.newLongURL === undefined) {
    urlDatabase[generateRandomString()] = {
      longURL: req.body.longURL,
      userID: req.session.ID
    };
    res.redirect("/urls");
  }
});

//url page information

app.get("/urls", (req,res) =>{
  if (users[req.session.ID]) {
    const templateVars = {
      urls: urlsForUser(req.session.ID),  
      user: users[req.session.ID],
      email: users[req.session.ID].email
    };
    res.render("urls_index", templateVars);
  } else {
    const templateVars = {
      urls: urlsForUser(req.session.ID),
      user: users[req.session.ID],
      email: undefined
    };
    res.render("url_login", templateVars);
  }
});

// shortern to /u/
app.get("/u/:shortURL", (req,res) => {
  const sURL = req.params.shortURL;
  const lURL = urlDatabase[sURL].longURL;
  if (lURL) {
    return res.redirect(lURL);
  }
  return res.send("Did not find this short URL's corresponding long URL");
});

// individual page redirecting to the actual url
app.get("/urls/:shortURL", (req,res) => {
  const sURL = req.params.shortURL;
  if (!urlDatabase[sURL]) {
    res.status(404).send("Did not find this URL");
    return;
  } else {
    const lURL = urlDatabase[sURL].longURL;
    if (!users[req.session.ID ]) {
      return res.send("you need to login to your account first.");
    } else if (req.session.ID === urlDatabase[sURL]["userID"]) {
      const templateVars = {
        shortURL:sURL,
        longURL:lURL,
        user: users[req.session.ID],
        email: users[req.session.ID].email
      };
      res.render("urls_show", templateVars);
    } else {
      return res.send("you don't have the authorization to access this link.");
    }
  }
});

app.post("/urls/:shortURL", (req,res) => {
  const sURL = req.params.shortURL;
  if (!users[req.session.ID]) {
    return res.send("you need to login to your account first.");
  } else if (req.session.ID  === urlDatabase[sURL]["userID"]) {
    const nlURL = req.body.newLongURL;
    urlDatabase[sURL].longURL = nlURL;  
    res.redirect("/urls");
  } else {
    return res.send("you don't have the authorization to access this link.");
  }
});

// registration
app.get("/register", (req,res) => {
  const templateVars = {user: users[req.session.ID]};
  res.render("url_register", templateVars);
});

app.post("/register", (req, res) =>{
  const email = req.body.email;
  const password = req.body.password;
  if (!password || !email ) {
    return res.status(401).send("please enter a valid password / email");
  }
  const userFound = getUserByEmail(email, users);
  if (userFound) {
    return res.status(400).send("sorry, that user already exists!");
  }
  const userId = createUser(email, password, users);
  req.session.ID = userId;
  console.log(req.session.ID);
  res.redirect("/urls");
});

//login
app.get("/login", (req,res) => {
  const templateVars = {user: users[req.session.ID]};
  res.render("url_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userLogged = authenticateUser(email, password, users); 
  if (userLogged) {
    req.session.ID =  userLogged.id;
    res.redirect('/urls');
  } else {
    return res.status(403).send("Please check your username and password again.");
  }
});
  
//logout
app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/urls");
});

// delete from db

app.post("/urls/:shortURL/delete", (req,res) => {
  const sURL = req.params.shortURL;
  if (!users[req.session.ID]) {
    return res.send("you need to login to your account first.");
  } else if (req.session.ID === urlDatabase[sURL]["userID"]) {
    if (delete urlDatabase[sURL]) {
      res.redirect("/urls");
    }
  } else {
    return res.send("you don't have the authorization to access this link.");
  }
});

app.listen(PORT, ()=>{
  console.log(`example app is listening on port ${PORT}`);
});