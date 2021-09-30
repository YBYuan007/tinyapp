const bcrypt = require("bcryptjs"); 
const password = 'purple-monkey-dinosaur' ; 
const hashedPassword = bcrypt.hashSync(password,10); 

console.log(hashedPassword);
// bcrypt.compareSync("pink-donkey-minotaur", hashedPassword);
console.log(bcrypt.compareSync('purple-monkey-dinosaur',hashedPassword));


const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");