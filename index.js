const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./models/user')
const logger = require('morgan')
const appController = require('./controllers/application_controller')

const app = express()

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect('mongodb://localhost/express-api-user-token-auth')

// enable cors for all routes
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, User-Email, Auth-Token, Authorization')
  next()
})

// serve everything in assets folder as static, so we can get our single html page
app.use(express.static('public'))

app.post('/signup', (req, res) => {
  const user = new User(req.body)

  user.save((err, user) => {
    if (err) return res.status(422).json({error: err.message})

    res.status(201).json({message: 'user created', user: {name: user.name, email: user.email}, auth_token: user.auth_token})
  })
})

app.post('/signin', (req, res) => {
  const userParams = req.body

  User.findOne({email: userParams.email}, (err, user) => {
    if (err || !user) return res.status(401).json({error: 'email or password is invalid'})

    user.authenticate(userParams.password, (err, isMatch) => {
      if (err || !isMatch) return res.status(401).json({error: 'email or password is invalid'})

      res.status(201).json({message: 'user logged in', user: {name: user.name, email: user.email}, auth_token: user.auth_token})
    })
  })
})

// unprotected root route
app.get('/', (req, res) => {
  res.status(200).json({message: 'hello'})
})

// middleware can be used to protect all routes below it
app.use(appController.userLoggedIn)

// get the currently logged in user
app.get('/user', (req, res) => {
  res.status(200).json({name: req.user.name, email: req.user.email})
})

// add extra protection, so only specific use can access route
app.get('/users-secret', (req, res) => {
  // comparing against a hardcoded id but in reality we would likely be checking a ref-id from a db record e.g. post.owner_id
  if (req.user.id !== '58a510e5a325ac20eece5341') {
    console.log(req.user.id)
    return res.status(401).json({error: 'unauthorised'})
  }
  // else
  res.status(200).json({message: 'this is your super secret content'})
})
app.listen(3000, () => {
  console.log('listening on port 3000')
})
