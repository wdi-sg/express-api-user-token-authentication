const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const uuid = require('uuid');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  auth_token: { type: String, unique: true }
})

UserSchema.pre('save', function (done) {
  const user = this

  if (!user.isModified('password')) return done()

  bcrypt.genSalt(8, (err, salt) => {
    if (err) return done(err)

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return done(err)

      user.password = hash
      done()
    })
  })

  // generate token
  user.auth_token = uuid.v4()
})

UserSchema.methods.authenticate = function (password, callback) {
  bcrypt.compare(password, this.password, callback)
}

const User = mongoose.model('User', UserSchema)

module.exports = User
