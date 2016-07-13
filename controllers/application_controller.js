const User = require('../models/user')
const basicAuth = require('basic-auth')

function userLoggedIn (req, res, next) {
  const userEmail = req.get('User-Email')
  const authToken = req.get('Auth-Token')
  console.log(basicAuth)
  if (!userEmail || !authToken) return res.status(401).json({error: 'unauthorised'})

  User.findOne({email: userEmail, auth_token: authToken}, (err, user) => {
    if (err || !user) return res.status(401).json({error: 'unauthorised'})

    req.currentUser = user
    next()
  })
}

// The following method allows the authentication token to be passed as HTTP basic authentication header, custom headers or in the query string or body
function userLoggedInAdvanced (req, res, next) {
  // first check if we have HTTP Basic Auth
  const auth = basicAuth(req)
  let userEmail, authToken
  if (auth) {
    userEmail = auth.name
    authToken = auth.pass
  } else {
    // else we just look in the http header or body or params
    userEmail = req.get('User-Email') || req.body.user_email || req.query.user_email
    authToken = req.get('Auth-Token') || req.body.auth_token || req.query.auth_token
  }

  console.log(auth)
  if (!userEmail || !authToken) return res.status(401).json({error: 'unauthorised'})

  User.findOne({email: userEmail, auth_token: authToken}, (err, user) => {
    if (err || !user) return res.status(401).json({error: 'unauthorised'})

    req.currentUser = user
    next()
  })
}

module.exports = {
  userLoggedIn: userLoggedInAdvanced
}
