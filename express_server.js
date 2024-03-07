const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const { getUserByEmail, generateRandomString, isLoggedIn, isNotLoggedIn, postURLProtect, checkShortURL, users, urlDatabase } = require('./functions/helperFunctions');

// setting the ejs engine for our express app
app.set("view engine", "ejs");

// parses body for POST, to be legible to humans
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // parses cookie to show

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
app.get("/urls/new", isNotLoggedIn, (req, res) => {

  const templateVars = {
    user: req.cookies["user_id"], // passes user_id to front end conditional
  };

  res.render("urls_new", templateVars);
});

// allows user to create new tinyurl and have it saved in global bd
app.post("/urls", postURLProtect, (req, res) => {

  const id = generateRandomString(); // generates the rand id key

  const { longURL } = req.body;// assigns the longURL value
  urlDatabase[id] = longURL; // adds to db by key-value pair.

  res.redirect(`/urls/${id}`); // redirects user to newly created short and long url
});

// show the register page
app.get('/register', isLoggedIn, function(req, res, next) {
  const templateVars = {
    user: req.cookies["user_id"], // passes user_id to front end conditional
  };

  res.render('register', templateVars);
});

// post for register page
app.post("/register", (req, res) => {

  let { password, email } = req.body;
  let id = generateRandomString();

  // checks if email or password exists. password is required on the front-end
  if (!email || !password) {
    return res.status(400).send(`Password and Email cannot be blank`);
  }
  // uses the global func to check if email exists
  if (getUserByEmail(email)) {
    return res.status(400).send(`Email already exists to an account`);
  }

  // creates an object inside users obj with random ID
  users[id] = {
    id: id,
    email: email,
    password: password
  };


  res.cookie('user_id', users[id]);
  res.redirect('/urls');



});

app.get("/login", isLoggedIn, (req, res) => {

  const templateVars = {
    user: req.cookies["user_id"]
  };

  res.render('login', templateVars);
});

// user creates user_id and stored in cookie called user_id
app.post("/login", (req, res) => {

  let { password, email } = req.body;
  let user = getUserByEmail(email);


  // checks if email exists.
  if (!user) {
    return res.status(403).send(`Email not found, please register.`);
  }
  // checks to see if the password in the usersdb
  if (user.password !== password) {
    return res.status(403).send(`Incorrect password. Please try again.`);
  }

  res.cookie("user_id", user);
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {

  res.clearCookie('user_id');
  res.redirect("/login");

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
app.get("/u/:id", checkShortURL, (req, res) => {

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
