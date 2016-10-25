const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const base64url = require('base64url')

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

      crypto.randomBytes(64, (err, buf) => {
        if (err) done(err)
        // generate auth_token
        user.auth_token = base64url(buf)
        done()
      })
    })
  })
})

UserSchema.methods.authenticate = function (password, callback) {
  bcrypt.compare(password, this.password, callback)
}

const User = mongoose.model('User', UserSchema)

module.exports = User
