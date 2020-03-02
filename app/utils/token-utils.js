const GoogleUser = require("../models/GoogleUser");

module.exports = {
  getToken: async googleId => {
    let user = await GoogleUser.findOne({ googleId: googleId });
    if (user) {
      return user.token;
    }
  }
};
