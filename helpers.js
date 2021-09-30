const getUserByEmail = function(email, users) {
    for (let userId in users) {
      const user = users[userId];
      if (email === user.email) {
        return user; //detailed user information 
      }
    }
    return false;
  };

module.exports= {getUserByEmail};