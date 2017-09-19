const express = require('express');
const ip = require('ip')
const prometheus = require('prom-client')

prometheus.collectDefaultMetrics();
const app = new express()

app.get("/selftest", (req, res) => {
    res.send("up")
})

app.get("/isready", (req, res) => {
    res.sendStatus(200)
})

app.get("/isalive", (req, res) => {
    res.sendStatus(200)
})

app.get('/metrics', (req, res) => {
	res.set('Content-Type', prometheus.register.contentType);
	res.end(prometheus.register.metrics());
});

app.get("/env", (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.send(JSON.stringify(process.env))
})

app.get("/whoami", (req, res) => {
    const version = process.env['app_version']
    res.send(`version ${version} @ ${ip.address()}`)
})

app.listen(8080, () => {
    console.log('running on port 8080')
})
