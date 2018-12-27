const express = require('express');
const app  = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
const session = require('express-session') 
const bodyParser = require('body-parser')
const passport = require('passport')
const passportConfig = require('./config/passport')
const routes = require('./routes/index.js')
const port =  process.env.PORT || 3000

app.use(express.static(__dirname))
app.use(express.static(__dirname + '/views'))
app.set('views', __dirname + '/views')
app.use(session({
    secret: 'lordylordylord', 
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 100 * 60 * 60 * 24 * 30} ///30 days
  }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(passport.initialize())
app.use(passport.session())

routes(app, passport, io)
passportConfig(passport)

http.listen(port, () => console.log('App is live'))

//Socket connection
io.on('connection', (socket) => {
  console.log('User connected')
})