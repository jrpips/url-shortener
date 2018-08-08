'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns=require('dns');
var cors = require('cors');
var app = express();

var port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGOLAB_URI,{ useNewUrlParser: true });
var db=mongoose.connection;

// API model
let shorturlSchema=mongoose.Schema({
  url:{type:String,required:true},
  shortURL:Number
})

let Url=mongoose.model('Url',shorturlSchema);

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// API be redirect with a submit shorturl
app.get('/api/shorturl/:url',function(req,res){
  
  let shorturl=parseInt(req.params.url);
  
  Url.findOne({ 'shortURL': shorturl }, function (err, url) {
    if (err) return console.error(err);
    if(url) {res.redirect('http://'+url.url);}
    else {res.json({"No record for this short URL ":shorturl});}
 });
});

// API save a new couple url:short url
app.post("/api/shorturl/new", function (req, res) {
  
  let a=req.body.url.indexOf('/')!==-1?2:1;
  let url=req.body.url.substr(req.body.url.indexOf("/")+a,req.body.url.length);
  
  // API 
  dns.lookup(url, (err, addresses) =>{ 
    if(addresses!=undefined){
      Url.countDocuments({},function(err,nb){
        
        var newUrl=new Url({'url':url,'shortURL':nb+1})
        
        newUrl.save(function(err,uri){
          if(err) return console.error(err);
          res.json({"original_url": url,"short_url":nb+1});
        })
      });
    }
    else res.json({"error":"invalid URL"});
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});