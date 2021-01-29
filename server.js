require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

let mongodb = require("mongodb");
let mongoose = require("mongoose");
mongoose.set('useFindAndModify', false); 

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

/* Database Connection */

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let urlSchema = new mongoose.Schema({
  original : {type: String, required: true},
  short: Number
})

let Url = mongoose.model('Url', urlSchema)

let bodyParser = require('body-parser')
let responseObject = {}
app.post('/api/shorturl/new', bodyParser.urlencoded({ extended: false }) , (request, response) => {
  let inputUrl = request.body['url']
  
  let urlRegex = new RegExp( /^[http://www.]/gi )
  
  if(!inputUrl.match(urlRegex)){
    response.json({error: 'invalid url'})
    return
  }
    
  responseObject['original_url'] = inputUrl
  
  let inputShort = 1
  
  Url.findOne({})
        .sort({short: 'desc'})
        .exec((error, result) => {
          if(!error && result != undefined){
            inputShort = result.short + 1
          }
          if(!error){
            Url.findOneAndUpdate(
              {original: inputUrl},
              {original: inputUrl, short: inputShort},
              {new: true, upsert: true },
              (error, savedUrl)=> {
                if(!error){
                  responseObject['short_url'] = savedUrl.short
                  response.json(responseObject)
                }
              }
            )
          }
  })
  
})

app.get('/api/shorturl/:input', (request, response) => {
  let input = request.params.input
  
  Url.findOne({short: input}, (error, result) => {
    if(!error && result != undefined){
      response.redirect(result.original)
    }else{
      response.json('URL not Found')
    }
  })
})













// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const app = express();
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");

// app.use(bodyParser.urlencoded({extended: true}));
// mongoose.connect(process.env.MONGO_URI, ({useNewUrlParser: true, useUnifiedTopology: true}));

// let urlSchema = new mongoose.Schema({
// original: {type: String, required: true},
// short : Number
// });

// let Url = mongoose.model("Url", urlSchema);


// let responseObj = {};
// app.post("/api/shorturl/new", (req, res) => {
//   let input = req.body.url;

// let urlRegExp = new RegExp(/^[http://www.]/gi);

// if(!input.match(urlRegExp)){
//   res.json({error: "Invalid URL"});
//   return;
// }

//   responseObj["original_url"] = input;


//   let inputShort = 1;

//   Url.findOne({})
//   .sort({short: "desc"})
//   .exec((error, result) => {
//     if(!error && result != undefined){
//       inputShort = result.short + 1;
//     }
//     if(!error){
//       Url.findOneAndUpdate({original: input}, {original: input, short: inputShort}, {new : true, upsert: true}, (error, savedUrl) => {
//         if(!error){
//           responseObj["short_url"] = savedUrl.short;
//           res.json(responseObj);
//         }
//       })
//     }
//   })



// })















// // Basic Configuration
// const port = process.env.PORT || 3000;

// app.use(cors());

// app.use('/public', express.static(`${process.cwd()}/public`));

// app.get('/', function(req, res) {
//   res.sendFile(process.cwd() + '/views/index.html');
// });

// // Your first API endpoint
// app.get('/api/hello', function(req, res) {
//   res.json({ greeting: 'hello API' });
// });

// app.listen(port, function() {
//   console.log(`Listening on port ${port}`);
// });
