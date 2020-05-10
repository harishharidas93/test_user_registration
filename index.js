const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const routes = require('./routes/routes.js');

app.set('port', PORT);
app.set('env', NODE_ENV);
app.use(bodyParser.json());
app.use('/', routes);

app.listen(PORT, () => {
  console.log(
    `Express Server started on Port ${app.get(
      'port'
    )} | Environment : ${app.get('env')}`
  );
});
