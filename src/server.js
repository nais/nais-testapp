const express = require('express');
const http = require("http");
const ip = require('ip');
const os = require('os');
const prometheus = require('prom-client');
const physical = require('express-physical');
const request = require('request').defaults({ rejectUnauthorized: false});

const alertCounter = new prometheus.Counter({
  name: 'alerts_triggered',
  help: 'Used to trigger alerts manually.'
});

prometheus.collectDefaultMetrics();
const app = new express();
let server;

app.get("/selftest", (req, res) => {
    res.send("up");
});

app.get("/isready", (req, res) => {
    res.sendStatus(200);
});

app.get("/isalive", (req, res) => {
    res.sendStatus(200);
});

app.get('/metrics', (req, res) => {
    res.set('Content-Type', prometheus.register.contentType);
    res.end(prometheus.register.metrics());
});

app.get("/env", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(process.env));
});

app.get("/whoami", (req, res) => {
    const version = process.env['app_version'];
    res.send(`version ${version} @ ${ip.address()}`);
});

app.get("/headers", (req, res) => {
    res.send(JSON.stringify(req.headers));
});

app.get("/testConnectivity", (req, res) => {
    let testConnectivityUrl = process.env.TEST_CONNECTIVITY_URL

    console.log("Testing connectivity to: ", testConnectivityUrl);
    req.pipe(request(testConnectivityUrl))
        .on('error', (e) => res.send(e))
        .pipe(res);
});

server = app.listen(8080, () => {
    console.log('running on port 8080')
});

