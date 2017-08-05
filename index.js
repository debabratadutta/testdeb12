/*
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* jshint node: true, devel: true */
'use strict';

const  express = require('express');
const  bodyParser = require('body-parser');
const  request = require('request');
const  app = express();

const token = process.env.FB_VERIFY_ACCESS_TOKEN

app.set('port', process.env.PORT || 5000);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req,res){
  res.send('Hello YouTube!')
})

app.get('/webhook/',function(req,res){
  if(req.query['hub.verify_token']==='debYsdeb931'){
    res.send(req.query['hub.challenge'])
  }
  res.send('No entry')
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

//module.exports = app;
