const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://test_user:test_pass@cluster0-n9qah.mongodb.net/test?retryWrites=true&w=majority";
const jwt = require('jsonwebtoken');
const jwt_secret = "jwttokenaccubits";
const jwt_expiration = 60 * 10;
const jwt_refresh_expiration = 60 * 60 * 24 * 30;

const
  redis     = require('redis'),
  redisClient    = redis.createClient({
    port      : 6379,
    host      : '120.0.0.1',
    password  : 'soft12'
  });

MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const userCollection = client.db("test").collection("users");

    router.post('/register_user', (req, res) => {
      userCollection.insertOne({...req.query,tokens: []})
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

    // To get all user details
    router.get('/get_user_details', (req, res) => {
        userCollection.find().project({name: 1, email:1, _id:0}).toArray()
          .then(results => {
            if(results.length == 0){
              res.send({
                status: 'error',
                message: 'No user added'
              });
            } else res.send({status:'success',data:results})
          })
          .catch(error => {
            console.error(error);
            res.send({
                status : 'error',
                message: error
            });
          })
    })

    // To get login details of a specific user
    router.get('/get_user_login_details', (req, res) => {
        userCollection.find(req.query).project({tokens: 1,_id:0}).toArray()
          .then(results => {
            if(results.length == 0){
              res.send({
                status: 'error',
                message: 'No login detected'
              });
            } else res.send({status:'success',data:results})
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
          if(results && results.length == 1) {
              let user_name = req.query.name;
              let refresh_token_maxage = new Date() + jwt_refresh_expiration;
              // Generate new access token
              let token = jwt.sign({ uid: user_name }, jwt_secret, {
                  expiresIn: jwt_expiration
              });
              // And store the user in Redis under key 2212
              redisClient.set(user_name, JSON.stringify({
                refresh_token: token,
                expires: refresh_token_maxage,
                }),
                redisClient.print
              );
              userCollection.findOneAndUpdate({ name: user_name },
              {
                $push: {
                  tokens: {
                    token: token,
                    time: new Date()
                  }
                }
              }, {upsert : true})
              .then(result => {
                res.send({status:'success'})
              })
              .catch(error => console.error(error))
              
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
