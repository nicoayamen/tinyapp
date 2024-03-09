const { assert } = require('chai');

const { getUserByEmail } = require('../functions/helperFunctions');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert(user.id === expectedUserID, `Expected user ID to be ${expectedUserID}`)
  });

  it(`should return null with invalid email`, function() {
    const user = getUserByEmail("cait2@gmail.com", testUsers)

    assert(user === null, `User email does not exists`)
  });
});
