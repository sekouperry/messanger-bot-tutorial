'use strict'

var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')

var Config = require('./config')
var FB = require('./connectors/facebook')
var Bot = require('./bot')


// LETS MAKE A SERVER!
var app = express()
app.set('port', (process.env.PORT) || 5000)
// SPIN UP SERVER
app.listen(app.get('port'), function () {
  console.log('Running on port', app.get('port'))
})
// PARSE THE BODY
app.use(bodyParser.json())


// index page
app.get('/', function (req, res) {
  res.send('hello world i am a chat bot')
})

// for facebook to verify
app.get('/webhooks', function (req, res) {
  console.log("##########VERIFY TOKEN##########")
  if (req.query['hub.verify_token'] === Config.FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

// to send messages to facebook
app.post('/webhooks', function (req, res) {
  console.log("##########SEND MESSAGE TO FACEBOOK##########")
  var entry = FB.getMessageEntry(req.body)
  // IS THE ENTRY A VALID MESSAGE?
  if (entry && entry.message) {
    if (entry.message.attachments) {
      // NOT SMART ENOUGH FOR ATTACHMENTS YET
      FB.newMessage(entry.sender.id, "That's interesting!")
    } else {
      console.log(entry.message.text);
      // FB.newMessage(entry.sender.id, "You say: " + entry.message.text)
      // SEND TO BOT FOR PROCESSING
      Bot.read(entry.sender.id, entry.message.text, function (sender, reply) {
        FB.newMessage(sender, reply)
      })
    }
  }

  res.sendStatus(200)
  // console.log(JSON.stringify(req.body));
  // var messaging_events = req.body.entry[0].messaging;
  // for (var i = 0; i < messaging_events.length; i++)
  // {
  //   var event = req.body.entry[0].messaging[i];
  //   var sender = event.sender.id;
  //   if( event.message && event.message.text )
  //   {
  //     var text = event.message.text;
  //     console.log(text);
  //   }
  // }
  
  // res.sendStatus(200)
})
