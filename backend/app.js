var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var searchRoutes = require('./routes/search');

var app = express();
var port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors());
app.use('/search', searchRoutes);

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

