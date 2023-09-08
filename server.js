const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');
const connectHistoryApiFallback = require('connect-history-api-fallback');
const compression = require('compression');


const app = express();


app.use(compression());

app.use(connectHistoryApiFallback({
    verbose: false
  }));

const oneYearInSeconds = 31536000;
app.use(express.static(path.join(__dirname, 'build'), { maxAge: oneYearInSeconds * 1000 }));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
  

// read SSL/TLS certificate and private key
const privateKey = fs.readFileSync('privkey.pem');
const certificate = fs.readFileSync('fullchain.pem');
const credentials = { key: privateKey, cert: certificate };

// create HTTPS server
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(443);
