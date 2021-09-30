const { response } = require("express");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 8080;
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

app.use(express.urlencoded({extended:true}));
app.set("view engine", "ejs");
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

// database

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

// const hashedPassword1 = bcrypt.hashSync("purple-monkey-dinosaur" , salt);
// const hashedPassword2 = bcrypt.hashSync("dishwasher-funk", salt);

const hashPW = function(userPW) {
  return bcrypt.hashSync(userPW, salt);
};

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

const findUserByEmail = function(email, users) {
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      return user;
    }
  }
  return false;
};

const authenticateUser = function(email, password, users) {
  const userFound = findUserByEmail(email, users);
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

// add new url link
app.get("/urls/new", (req, res) => {
  // const email = users[userId].email;
  if (users[req.session.email]) {
    const templateVars = {user: users[req.session.email]};
    res.render("urls_new", templateVars);
  } else {
    res.status(404).send("You need to login to shortern the URL.");
  }
});

app.post("/urls" , (req,res)=>{
  if (req.body.newLongURL === undefined) {
    urlDatabase[generateRandomString()] = {
      longURL: req.body.longURL,
      userID: req.session.email
    };
    console.log("urlDATABASE: ", urlDatabase);
    console.log("users database: " , users);
    res.redirect("/urls");
  }
});

//url page information
app.get("/urls", (req,res) =>{
  const templateVars = {
    urls: urlsForUser(req.session.email),  // return an object that belongs to the user
    user: users[req.session.email]
  };
  res.render("urls_index", templateVars);
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
    res.send("Did not find this URL");
  } else {
    const lURL = urlDatabase[sURL].longURL;
    const templateVars = {
      shortURL:sURL,
      longURL:lURL,
      user: users[req.session.email]
    };
    if (!users[req.session.email ]) {
      res.send("you need to login to your account first.");
    } else if (req.session.email === urlDatabase[sURL]["userID"]) {
      res.render("urls_show", templateVars);
    } else {
      res.send("you don't have the authorization to access this link.");
    }
  }
});

app.post("/urls/:shortURL", (req,res) => {
  const sURL = req.params.shortURL;
  if (!users[req.session.email]) {
    res.send("you need to login to your account first.");
  } else if (req.session.email  === urlDatabase[sURL]["userID"]) {
    const nlURL = req.body.newLongURL;
    urlDatabase[sURL].longURL = nlURL;  // response with userID
    res.redirect("/urls");
  } else {
    res.send("you don't have the authorization to access this link.");
  }
});

// registration

app.get("/register", (req,res) => { // user yell and they want something from me
  const templateVars = {user: users[req.session.email]};
  res.render("url_register", templateVars);
});

app.post("/register", (req, res) =>{ // user send me something
  const email = req.body.email;
  const password = req.body.password;
  if (!password || !email) {
    res.status(401).send("please enter a valid password / email");
  }
  const userFound = findUserByEmail(email, users);
  if (userFound) {
    res.status(400).send("sorry, that user already exists!");
    return;
  }
  const userId = createUser(email, password, users);
  req.session.email = userId;
  console.log(req.session.email);
  // res.cookie("user_id", userId);
  res.redirect("/urls");
});

//login
app.get("/login", (req,res) => { // user yell and they want something from me
  const templateVars = {user: users[req.session.email]};
  res.render("url_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userLogged = authenticateUser(email, password, users); // return userFound aka user information
  if (userLogged) {
    req.session.email =  userLogged.id;
    // res.cookie('user_id', userLogged.id); //we response with the cookie which will stay with the user.
    res.redirect('/urls');
  } else {
    res.status(403).send("Please check your username and password again.");
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
  if (!users[req.session.email]) {
    res.send("you need to login to your account first.");
  } else if (req.session.email === urlDatabase[sURL]["userID"]) {
    delete urlDatabase[sURL];
    
    res.redirect("/urls");
  } else {
    res.send("you don't have the authorization to access this link.");
  }
});

app.listen(PORT, ()=>{
  console.log(`example app is listening on port ${PORT}`);
});