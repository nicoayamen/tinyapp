
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

// checks to see if user email exists
function getUserByEmail(email) {

  for (let key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return null;
};

function isLoggedIn(req, res, next) {
  //check to see if user_id cookie is true (stored)
  if (req.cookies.user_id) {
    //if cookie is found, user is logged in. Redirect to /urls.
    res.redirect('/urls');
  } else {
    // if cookie found, proceed to the next route handler
    next();
  }
};

function isNotLoggedIn(req, res, next) {
  if (!req.cookies.user_id) {
    res.redirect('/login');
  } else {
    next();
  }
}

function postURLProtect(req, res, next) {
  if (!req.cookies.user_id) {
    res.render('error');
  } else {
    next();
  }
};

function checkShortURL(req, res, next) {
  const id = req.params.id;
  
  if (!urlDatabase[id]) {
    res.render('error_id');
  } else {
    next();
  }
}



module.exports = {
  generateRandomString,
  getUserByEmail,
  isLoggedIn,
  isNotLoggedIn,
  postURLProtect,
  checkShortURL,
  urlDatabase,
  users,
};