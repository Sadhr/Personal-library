/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
        if(err) console.log(`Error to connect to the DB: ${err}`);
        
        const db = client.db().collection('books');
        db.find().toArray((err, docs) => {
          if(err) console.log(`Error: ${err}`);
          
          for(let i = 0; i < docs.length; i++){
            if(docs[i].comments){
              docs[i].commentcount = docs[i].comments.length;
              delete docs[i].comments;
            }else{
              docs[i].commentcount = 0;
            }
          }
          
          res.json(docs);
          
        });
      });
    
    })
    
    .post(function (req, res){
      const title = req.body.title;
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
        if(err) console.log(`Error to connect to the DB: ${err}`);
        
        const db = client.db().collection('books');
        if(!title){
          res.send('missing title');
        }else{
          db.insertOne({title: title}, (err, doc) => {
            if(err) console.log(`Insertion error: ${err}`);
            res.json(doc.ops[0]);
          });
        }
        
      });
    })
    
    .delete(function(req, res){
      
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
        if(err) console.log(`Error to connect to the DB: ${err}`);
        
        const db = client.db().collection('books');
        db.deleteMany();
        res.send('complete delete successful')
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      const bookid = req.params.id;
     
      if(!ObjectId.isValid(bookid)){
        res.send('<pre>no book exists</pre>');
      }else{
        MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
          if(err) console.log(`Error to connect to the DB: ${err}`);

          const db = client.db().collection('books');

          db.findOne({ _id: new ObjectId(bookid) }, (err, doc) => {
            if(err) console.log(`Error found: ${err}`);
            res.json(doc);
          });

        });
      }
    })
    
    .post(function(req, res){
      const bookid = req.params.id;
      const comment = req.body.comment;
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
        if(err) console.log(`Error to connect to the DB: ${err}`);
        
        const db = client.db().collection('books');
        
       /*db.findOneAndUpdate(
          {_id: new ObjectId(bookid)},
          {$push: {comments: comment}},
          {new: true},
          (err, docs) => {
            //if(!docs.value) return res.send('Book not found');
            console.log(docs);
            res.json(docs);
          }
        ); */
        
        db.findAndModify(
          {_id: new ObjectId(bookid)},
          {},
          {$push: {comments: comment}},
          {new: true},
          (err, docs) => {
            if(err) console.log(`Error found: ${err}`);
            if(!docs.value) return res.send('<pre>no book exists</pre>');
            res.json(docs.value);
          });
          
      });
    
    })
    
    .delete(function(req, res){
      const bookid = req.params.id;
    
      if(!bookid){
        res.send('_id error');
      }else{
        MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
          if(err) console.log(`Error to connect to the DB: ${err}`);
        
          const db = client.db().collection('books');
          db.findOneAndDelete({ _id: new ObjectId(bookid) }, (err, del) => {
            err ? res.send('No book found') : res.send('delete successful');
          });
        });
      }
    });
  
};
