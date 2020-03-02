var express = require("express");
var router = express.Router();
var gcal = require("google-calendar");
const refresh = require("passport-oauth2-refresh");
const GoogleUser = require("../models/GoogleUser");
const tokenUtils = require("../utils/token-utils");

// POST
// /calendar/list
// Returns a list of calendar objects for a given user
router.post("/list", (req, res) => {
  // const accessToken = req.body.token;
  const googleId = req.body.googleId;
  let refreshToken;

  tokenUtils.getToken(googleId).then(accessToken => {
    const googleCalendar = new gcal.GoogleCalendar(accessToken);

    googleCalendar.calendarList.list(function(err, data) {
      if (err) {
        GoogleUser.findOne({ googleId: googleId }, (err, user) => {
          refreshToken = user.refreshToken;
          refresh.requestNewAccessToken("google", refreshToken, function(
            err,
            accessToken,
            refreshToken
          ) {
            user.token = accessToken;
            user.save().then(user => {
              const googleCalendar1 = new gcal.GoogleCalendar(user.token);

              googleCalendar1.calendarList.list((err, data) => {
                if (err) console.log(err);
                res.json(data);
              });
            });
          });
        });
      } else {
        return res.json(data);
      }
    });
  });
});

// POST
// /calendar/events
// Returns a list of events for a given calendar
router.post("/events", (req, res) => {
  const googleId = req.body.googleId;
  const id = req.body.id;

  tokenUtils.getToken(googleId).then(token => {
    const googleCalendar = new gcal.GoogleCalendar(token);

    googleCalendar.events.list(id, function(err, calendarList) {
      if (err) {
        GoogleUser.findOne({ googleId: googleId }, (err, user) => {
          refreshToken = user.refreshToken;
          refresh.requestNewAccessToken("google", refreshToken, function(
            err,
            accessToken,
            refreshToken
          ) {
            user.token = accessToken;
            user.save().then(user => {
              const googleCalendar1 = new gcal.GoogleCalendar(user.token);

              googleCalendar1.events.list(id, (err, data) => {
                if (err) {
                  res.json(err);
                } else {
                  res.json(data);
                  console.log(data);
                }
              });
            });
          });
        });
      } else {
        return res.json(calendarList);
      }
    });
  });
});

// POST
// /calendar/newevent
// Creates a new event for the calendar id passed in
router.post("/newevent", (req, res) => {
  const googleId = req.body.googleId;

  const id = req.body.id;
  const start = req.body.startDate;
  const end = req.body.endDate;
  const title = req.body.title;
  const params = {
    start: { dateTime: start },
    end: { dateTime: end },
    summary: title
  };

  tokenUtils.getToken(googleId).then(token => {
    const googleCalendar = new gcal.GoogleCalendar(token);
    googleCalendar.events.insert(id, params, function(err, data) {
      if (err) {
        GoogleUser.findOne({ googleId: googleId }, (err, user) => {
          console.log(user);
          refreshToken = user.refreshToken;
          refresh.requestNewAccessToken("google", refreshToken, function(
            err,
            accessToken,
            refreshToken
          ) {
            user.token = accessToken;
            user.save().then(user => {
              const googleCalendar1 = new gcal.GoogleCalendar(user.token);

              googleCalendar1.events.insert(id, params, (err, data) => {
                if (err) res.json(err);
                res.json(data);
              });
            });
          });
        });
      } else {
        return res.json(data);
      }
    });
  });
});

module.exports = router;
