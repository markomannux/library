/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(MONGODB_CONNECTION_STRING);

const bookSchema = new Schema({
  title: {type: String, required: true},
  comments: [String]
})

const Book = mongoose.model('book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      Book.aggregate()
      .project({
        title: 1,
        commentcount: {$size: "$comments"}
      })      
      .exec((err, data) => {
        if (err) {
          res.send(err.message);
          return;
        }

        res.json(data)
      });

    })
    
    .post(function (req, res){
      var title = req.body.title;
      let book = new Book(req.body);
      book.save((err, data) => {
        if (err) {
          if (err.errors.title) {
            res.send('missing title');
          } else {
            res.send('error during save');
          }
          return;
        }

        res.json(data);
      })
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      Book.findOne({_id: bookid}, (err, data) => {
        if (err) {
          console.log('error')
          res.send(err.message);
          return;
        }

        if (!data) {
          res.send('no book exists');
          return;
        }

        res.json(data);
      }) 
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      const book = Book.findByIdAndUpdate(
        bookid,
        {
          $push: { comments: comment}
        },
        {
          new: true,
          useFindAndModify: false
        },
        (err, data) => {
          res.json(data);
        });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
  
};
