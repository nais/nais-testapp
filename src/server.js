const express = require('express');
const ip = require('ip')
const app = new express();

app.get("/selftest", (req, res) => {
    res.send("up")
})

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





