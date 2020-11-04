module.exports = {
  // accepts either google or github respose profile and format for insertion in db
  formatUser: (profile, provider) => {
    let formattedUser;

    if(provider==='google') {
      formattedUser = {
        name: {
          firstName: profile._json.given_name,
          lastName: profile._json.family_name,
        },
        email: profile._json.email,
        provider: provider,
        isActivated: profile._json.email_verified
      }
    }
    return formattedUser;
  },
}
