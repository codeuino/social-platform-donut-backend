const express = require("express");
const router = express.Router();
const passport = require("passport");

// GET
// /oauth/google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/calendar"
    ],
    prompt: "consent",
    accessType: "offline"
  })
);

// GET
// /oauth/callback
// Callback url MUST BE similar to one mentioned in the
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/oauth/google" }),
  function(req, res) {
    const googleId = req.user.googleId;
    res.redirect("http://localhost:3000/calendar?googleId=" + googleId);
  }
);

module.exports = router;
