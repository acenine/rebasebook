const express = require('express');
let app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const db = require('../database-posgtres/index.js');
const api = require('./api');
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//serve static pages
app.use(express.static(__dirname + '/../client/dist'));

//handle /api endpoints
app.use('/api', api);


let port = 3000;
app.patch('/:username/updateProfile', (req, res) => {
  var username = req.params.username;
  var changes = req.body;
  db.updateProfilePageInfo(username, changes, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(data);
    }
  });
});

app.listen(process.env.PORT || port, function() {
  console.log(`listening on port ${port}`);
});
