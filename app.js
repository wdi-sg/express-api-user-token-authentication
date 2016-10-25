const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const logger = require('morgan')
const User = require('./models/user')
const appController = require('./controllers/application_controller')

const app = express()

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect(process.env.MONGODB_URI)

// enable cors for all routes
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, User-Email, Auth-Token, Authorization')
  next()
})

app.post('/signup', (req, res) => {
  const user = new User(req.body)

  user.save((err, user) => {
    if (err) return res.status(422).json({error: err.message})

    res.status(201).json({message: 'user created', auth_token: user.auth_token})
  })
})

app.post('/signin', (req, res) => {
  const userParams = req.body

  User.findOne({email: userParams.email}, (err, user) => {
    if (err || !user) return res.status(401).json({error: 'email or password is invalid'})

    user.authenticate(userParams.password, (err, isMatch) => {
      if (err || !isMatch) return res.status(401).json({error: 'email or password is invalid'})

      res.status(201).json({message: 'user logged in', auth_token: user.auth_token})
    })
  })
})

// unprotected root route
app.get('/', (req, res) => {
  res.status(200).json({message: 'hello'})
})
// secret routes
app.get('/secret', appController.userLoggedIn, (req, res) => {
  res.status(200).json({secret: 'content'})
})

// alternatively middleware can be used to protect all routes below it
app.use(appController.userLoggedIn)

// get the currently logged in user
app.get('/user', (req, res) => {
  res.status(200).json({name: req.currentUser.name})
})

// add extra protection, so only specific use can access route
app.get('/users-secret', (req, res) => {
  // comparing against a hardcoded id but in reality would be checking a ref-id from a db record e.g. post.owner_id
  if (req.currentUser.id !== '5785df577262545a997485b9') {
    return res.status(401).json({error: 'unauthorised'})
  }

  // else
  res.status(200).json({secret: 'content'})
})
app.listen(3000, () => {
  console.log('listening on port 3000')
})
