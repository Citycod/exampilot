// In-memory store for users
// A Map where key is email and value is the user object { id, email, passwordHash }
const users = new Map();

module.exports = {
  users,
  findUserByEmail: (email) => users.get(email),
  createUser: (user) => {
    users.set(user.email, user);
    return user;
  }
};
