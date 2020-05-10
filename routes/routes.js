const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://test_user:test_pass@cluster0-n9qah.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true,  useUnifiedTopology: true});


MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const userCollection = client.db("test").collection("users");
    router.post('/register_user', (req, res) => {
      userCollection.insertOne(req.query)
        .then(result => {
            res.send({
                status : 'success',
            });
        })
        .catch(error => {
            console.error(error);
            res.send({
                status : 'error',
                message: error
            });
          })
    })

    router.get('/get_user_details', (req, res) => {
        userCollection.find().toArray()
          .then(results => {
            // console.log(results)
            res.send({status:'success',data:results})
          })
          .catch(error => {
            console.error(error);
            res.send({
                status : 'error',
                message: error
            });
          })
      })
      
      router.post('/login', (req, res) => {
        userCollection.find(req.query).toArray()
          .then(results => {
            // Given length greater than 0 since currently while testing there are chances that same username may exist more than once
            if(results && results.length > 0) {
                console.log(results)
                res.send({status:'success'})
            } else { res.send({status:'no_user_found'}) }
          })
          .catch(error => {
            console.error(error);
            res.send({
                status : 'error',
                message: error
            });
          })
      })
  })
  .catch(error => {
    console.error(error);
    res.send({
        status : 'error',
        message: error
    });
  })

module.exports = router;
