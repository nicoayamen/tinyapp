const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail, generateRandomString, isLoggedIn, isNotLoggedIn, postURLProtect, checkShortURL, urlsForUser, users, urlDatabase } = require('./functions/helperFunctions');

// setting the ejs engine for our express app
app.set("view engine", "ejs");

// parses body for POST, to be legible to humans
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser()); // parses cookie to show
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// shows the entire db of urls in /urls
app.get("/urls", postURLProtect, (req, res) => {

  const userId = req.session.user_id;
  const user = users[userId];

  // checks to see what urls does specific user own
  let usersUrls = urlsForUser(userId);

  const templateVars = {
    user: user, // passes user_id to front end conditional
    urls: usersUrls, // shows user owned urls only. Blank if none created...
  };

  // renders the url_index template and passes the var above as the info shown to user
  res.render(`urls_index`, templateVars);
});

// shows page to create new url
app.get("/urls/new", isNotLoggedIn, (req, res) => {

  const userId = req.session.user_id;
  const user = users[userId];

  const templateVars = {
    user: user, // passes user_id to front end conditional
  };

  res.render("urls_new", templateVars);
});

// allows user to create new tinyurl and have it saved in global bd
app.post("/urls", postURLProtect, (req, res) => {

  // Check if user is logged in
  if (!userID) {
    return res.status(403).send("You must be logged in to shorten URLs.");
  }
  
  const id = generateRandomString(); // generates the rand id key

  const { longURL } = req.body;// assigns the longURL value

  const userID = req.session.user_id; // Assuming you're storing loggedIn userId in session


  urlDatabase[id] = {
    longURL: longURL,
    userID: userID
  };

  res.redirect(`/urls/${id}`); // redirects user to newly created short and long url
});

// show the register page
app.get('/register', isLoggedIn, function(req, res, next) {

  const userId = req.session.user_id;
  const user = users[userId];

  const templateVars = {
    user: user, // passes user_id to front end conditional
  };

  res.render('register', templateVars);
});

// post for register page
app.post("/register", (req, res) => {

  let { password, email } = req.body;
  let id = generateRandomString();

  // declare a var for hashed pass
  let hashedPassword = bcrypt.hashSync(password, 10)

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
    password: hashedPassword // replace plain pass with hashedPass
  };


  req.session.user_id = id;

  res.redirect('/urls');

});

app.get("/login", isLoggedIn, (req, res) => {


  const userId = req.session.user_id;
  const user = users[userId];

  const templateVars = {
    user: user
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
  // checks to see if the hashed password in the usersdb is the same as password being used 
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send(`Incorrect E-mail or password. Please try again.`);
  }

  // tells the session that this is the users cookie ID
  req.session.user_id = user.id;
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {

  // clears cookie in logout, or close session...
  req.session = null;
  res.redirect("/login");

});

// deletes entry from db and redirects
app.post("/urls/:id/delete", (req, res) => {

  const userId = req.session.user_id;

  // takes the searched parameter in url and shows user the url they were looking for
  const deleteID = req.params.id; // assign the id user wants to delete
  const url = urlDatabase[deleteID];

  // check if URL exists
  if (!url) {
    return res.send("URL Does Not Exist!");
  }

  // now check if url belongs to user
  if (url.userID !== userId) {
    return res.send(`Access Denied. You do not own this URL!`);
  }

  // if user owns it, delete
  else {
    delete urlDatabase[deleteID];
  }
  
  

  res.redirect("/urls");
});

// allows user to update the longURL of a certain entry using the ID
app.post("/urls/:id/update", (req, res) => {

  const { newLongURL } = req.body;
  const id = req.params.id;

  const userId = req.session.user_id;

  // urls id in the db to check if user owns it below
  const url = urlDatabase[id];

  // check if URL exists
  if (!url) {
    return res.send("URL Does Not Exist!");
  }

  // now check if url belongs to user
  if (url.userID !== userId) {
    return res.send(`Access Denied. You do not own this URL!`);
  }

  // if user owns it, edit/update
  else {
    urlDatabase[id].longURL = newLongURL; // based on the id, updates its longURL
  }
  

  res.redirect("/urls");
});

// redirects user to longURL site
app.get("/u/:id", checkShortURL, (req, res) => {

  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;

  res.redirect(longURL);
});

// user can search for specific tinyURL code to see its true URL and go to site, if known
app.get("/urls/:id", isNotLoggedIn, (req, res) => {

  const userId = req.session.user_id;
  const user = users[userId];

  // takes the searched parameter in url and shows user the url they were looking for
  const urlID = req.params.id;
  const url = urlDatabase[urlID]

  // check if URL exists
  if (!url) {
    return res.send("URL Does Not Exist!");
  }

  // now check if url belongs to user
  if (url.userID !== userId) {
    return res.send(`Access Denied. You do not own this URL!`);
  }

  // needs square bracket notation in order to show longURL
  const templateVars = {
    id: urlID,
    longURL: urlDatabase[urlID].longURL,
    user: user, // passes user_id to front end conditional
  };

    res.render(`urls_show`, templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
