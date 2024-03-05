const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser'); 

// setting the ejs engine for our express app
app.set("view engine", "ejs");

// parses body for POST, to be legible to humans
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // parses cookie to show

// returns a string of 6 random alphanumeric chars
function generateRandomString() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randString = "";

  for (let i = 0; i < 6; i++) {
    let randIndex = Math.floor(Math.random() * chars.length);
    randString += chars.charAt(randIndex);
  }

  return randString;


}


let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


// shows the entire db of urls in /urls
app.get("/urls", (req, res) => {

  const templateVars = { 
    user: req.cookies["user_id"], // passes user_id to front end conditional
    urls: urlDatabase,
  };

  // renders the url_index template and passes the var above as the info shown to user
  res.render(`urls_index`, templateVars);
 });

// shows page to create new url
app.get("/urls/new", (req, res) => {
  
  const templateVars = { 
    user: req.cookies["user_id"], // passes user_id to front end conditional
  };

  res.render("urls_new", templateVars);
});

// allows user to create new tinyurl and have it saved in global bd
app.post("/urls", (req, res) => {

  const id = generateRandomString(); // generates the rand id key

  const { longURL } = req.body;// assigns the longURL value
  urlDatabase[id] = longURL; // adds to db by key-value pair.

  res.redirect(`/urls/${id}`); // redirects user to newly created short and long url
});

// show the register page
app.get('/register', function(req, res, next) { 
  const templateVars = { 
    user: req.cookies["user_id"], // passes user_id to front end conditional
  };

  res.render('register', templateVars)
}); 

// post for register page
app.post("/register", (req, res) => {

  let { password, email  } = req.body;
  let id = generateRandomString();

  // creates an object inside users obj with random ID
  users[id] = {
    id: id,
    email: email,
    password: password
  }


  res.cookie('user_id', users[id]);
  res.redirect('/urls')
  
 

});

// user creates user_id and stored in cookie called user_id
app.post("/login", (req, res) => {

  res.redirect("/urls");

});

app.post("/logout", (req, res) => {

  res.clearCookie('user_id');
  res.redirect("/urls");

});

// deletes entry from db and redirects
app.post("/urls/:id/delete", (req, res) => {

  const deleteID = req.params.id; // assign the id user wants to delete
  delete urlDatabase[deleteID];

  res.redirect("/urls");
});

// allows user to update the longURL of a certain entry using the ID
app.post("/urls/:id/update", (req, res) => {

  const { newLongURL } = req.body;
  const id = req.params.id;
  
  urlDatabase[id] = newLongURL; // based on the id, updates its longURL

  res.redirect("/urls");
});

// redirects user to longURL site
app.get("/u/:id", (req, res) => {
  
  const id = req.params.id;
  const longURL = urlDatabase[id];

  res.redirect(longURL);
});

 // user can search for specific tinyURL code to see its true URL and go to site, if known
app.get("/urls/:id", (req, res) => {
  // takes the searched parameter in url and shows user the url they were looking for
  const urlID = req.params.id;
  // needs square bracket notation in order to show longURL
  const templateVars = { 
    id: urlID, 
    longURL: urlDatabase[urlID],
    user: req.cookies["user_id"], // passes user_id to front end conditional
  };
  res.render(`urls_show`, templateVars);
 });
 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
