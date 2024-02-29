const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// setting the ejs engine for our express app
app.set("view engine", "ejs");

// parses body for POST, to be legible to humans
app.use(express.urlencoded({ extended: true }));

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


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// shows the entire db of urls in /urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  // renders the url_index template and passes the var above as the info shown to user
  res.render(`urls_index`, templateVars);
 });

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

 // user can search for specific tinyURL code to see its true URL and go to site, if known
app.get("/urls/:id", (req, res) => {
  // takes the searched parameter in url and shows user the url they were looking for
  const urlID = req.params.id;
  // needs square bracket notation in order to show longURL
  const templateVars = { id: urlID, longURL: urlDatabase[urlID]};
  res.render(`urls_show`, templateVars);
 });
 

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
