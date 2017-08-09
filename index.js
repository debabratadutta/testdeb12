'use strict';

const  express = require('express');
const  bodyParser = require('body-parser');
const  request = require('request');
const admin = require("firebase-admin");
const  app = express();
//const serviceAccount = require("config/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "mybotdata",
    clientEmail: "mybotdata@appspot.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDmVkNQ79eo/Edn\nNyoASQTbL7s00D/GJeWAWr1DOjr1Zx+O6BIX23QRn0llvSQDaunCN7CGT3JF88vF\nzFSzUElHQd09TbW2rBFEQLSIfrmWremkwVkvAiswLzdQCxiwv6pNhu+RVqmYTUzZ\nN17elNZIi2gWatYC493QaoC4JGWfqROXJO/RpKARZjTn5sCPPerZrPGuAsJIaLM/\n6V7wjpcmt74qOYtQeJJs0TZi0tdWv6XwBV0wFhRp0keaXXiKbTm8gyDvqkrXR7xL\n2qWBGaBlEupiwGnZBAbiRBXRKqPsDjaqI8tVtBWEFveaGlC4QlOum62EEuT209En\nI09BMMq9AgMBAAECggEAHrn6L+VW0QmaYtf2h+Q1vCGRaRmwsDek9mrkXX/6lnsD\nuDYYF8ukH6eujF5fW/9aoJh6OWiGt3MuxzubPvJiXBmasE9aArzQbtjs3Fp/Wmzn\nwp0yTvWMmlhqGgjo6ccfqkjqU2qKpDEHo+BhjPKw5SuHnpnw46DPGbrjYe0lC1er\nXkPuQWoaFcNKor/+WX13J+E417JLeSH80qwEwMk+CTZytWbMb2MCjq9SCLWsBK6h\nCnEpEaoYuZSP594D1dsg/tKtd+MbcgrGRDuUWwOO1N4DJwMMlPF70nN+U/k6XIq/\ndj4XLOKURFXoy8GlCRv9Qe8tB/iamVkXVnFjw2l3NwKBgQD6jS+Aqhl8KvElzVmS\n9dSLvAcaSlDXh9n9/UeWGF0i4WseOhvqexZh2yCJta8KZnrATUUEOewL/zy9ApQN\njYF+a5GRqDMmK3W4Km1u6mCyFfjFhWwo1zQ7LmBxVy7FBA80ESG8rgeLmmVecMx+\nmEOp4pDETZOUFkwTbLkmJpLbewKBgQDrWIsjmJ7+XUYI4UlIyc5RW5GWECnSo+9p\n+JEyx1skhZbFCv8itaDp9sLpM6vLlMl+wCFUeM1UGxMPY9Po4EipysvsaNDPdJou\nNX1NHmO5Xm+aiNgM8YdjOb5m5ZvuqrSH2MiBYi4FNU9aPlwSnJcJjV2tokREJ8Sz\niXZ3u4uhJwKBgG474+R18lSBCCwblwdjhSodhfp5K+xH5w8qem59Naz9BIX+Bv45\nPXW8VSqBdwvaXrNwy6a6XTJCD9UQ51a3JXwbk6ZEHIz0ngxzDka4c+amaBdvRlEJ\nrf9DvkbflsIzsQS1bOR4pPU07tiIRFCGaW67MfpML1v+G2aIdUVlv0M1AoGAA3KI\nlzzlF1TGcdra9/X8z7RHrasO8cb0+thpSBUjgKV0T+6ZTija8pJqyH+5RIIpcXHf\nCx255EGBRfhwYjjm15Xg5tWiOWe72nFuJHMNgumfOORIRehD03BFGbzDS/u0KUlD\npqGJiwn835WKQ7uHetxXQvPdjCII/5hD4/0bToECgYEAlwCV+HbJxcrKzRgYxFUU\nA0+28HxZqSh7F3f7Jit/JJAa4AYnw+znbZlTaLnFJEgthg2ay5YPhYbyIGkNB8hu\njQ2Fwry0PWqGeCtXQonHetvjkha7gQZx7dnC/gCrq+DXmeXyk4wFq+EMq+nZtQV2\nHe9jc491LiXkyNhxBZpbM9U=\n-----END PRIVATE KEY-----\n"
  }),
  databaseURL: "https://mybotdata.firebaseio.com/"
});
const db = admin.database();

const token = process.env.FB_VERIFY_TOKEN
const access= process.env.FB_ACCESS_TOKEN

app.set('port', process.env.PORT || 5000);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req,res){
  res.send('Hello YouTube!')
})

app.get('/webhook/',function(req,res){
  if(req.query['hub.verify_token']===token){
    res.send(req.query['hub.challenge'])
  }
  res.send('No entry')
})

app.post('/webhook', function (req, res) {
  var data = req.body;
  if (data.object === 'page') {
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
  
  console.log("Received message for user %d and page %d at %d with message:", 
  senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;
  var typeMsg="text";
  if(messageAttachments){
    typeMsg="attachments";
  }
  var user = {
      dtaMsg: message,
      dtaTyp:typeMsg,
      timeMsg: timeOfMessage
  };
  var ref = db.ref("users");
  ref.child(senderID).once('value', function(snapshot){
      if (snapshot.exists()) {
          ref.child(senderID+"/allmessage").push(user);

          if (messageText) {
              switch (messageText) {
                case 'generic':
                  sendGenericMessage(senderID);
                  break;

                default:
                  sendTextMessage(senderID, messageText);
              }
            } else if (messageAttachments) {
              sendTextMessage(senderID, "Message with attachment received");
            }
      } else {
          var payload = {};
              payload[senderID+"/allmessage"] = user;
          ref.update(payload);
          sendStartingMessage(senderID);
      }
  });

  
}

function sendStartingMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    "message":{
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"Hello!:) {{user_first_name}} Rainmaker here to answer your questions. Since it’s our first conversation, would you like to know about Analyzen first?",
          "buttons":[
            
            {
              "type":"postback",
              "title":"Yeah! Why not?",
              "payload":"yes2ndConv"
            },
            {
              "type":"postback",
              "title":"No, not now.",
              "payload":"no2ndConv"
            }
          ]
        }
      }
    }
  };  

  callSendAPI(messageData);
}
function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: access },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

//module.exports = app;