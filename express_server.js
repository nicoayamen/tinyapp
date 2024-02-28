const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

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
