const express = require('express');
const http = require("http");
const ip = require('ip');
const os = require('os');
const prometheus = require('prom-client');
const physical = require('express-physical');
const request = require('request');
const Redis = require('ioredis');
const redis = (process.env.DISABLE_REDIS === "true") ? {"status": "disabled"} : newRedisConnection();


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

function getLeaderName(onResult) {
    let electorUrl = process.env["ELECTOR_PATH"];
    if (electorUrl === undefined) {
        onResult(404, "No URL in $ELECTOR_PATH, are you running with 'leaderElection: true'?");
        return;
    }

    let options = {
        url: "localhost",
        port: 4040
    }
    let req = http.request(options, function(res) {
        let output = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var result = JSON.parse(output);
            onResult(res.statusCode, result);
        });
    });

    req.on('error', function(err) {
        console.log(err.message)
    });

    req.end();
}

app.get("/getLeader", (req, res) => {
    getLeaderName(function(statusCode, result) {
        res.statusCode = statusCode;
        res.send(result);
    });
});

app.get("/isleader", (req, res) => {
    let hostname = os.hostname();
    getLeaderName(function(statusCode, result) {
        res.statusCode = statusCode;
        if (statusCode != 200) {
            res.send(result);
        } else {
            leaderName = result['name'];
            res.send(leaderName === hostname);
        }
    });
});

function newRedisConnection() {
    return new Redis({
        sentinels: [{ host: 'rfs-nais-testapp', port: 26379 }],
        name: 'mymaster'
    });
}

function isRedisReady() {
    return redis.status === "ready";
}

function parseRedisInfo(info) {
    function innerValues(info) {
        let data = {};
        let arr = info.split(",");
        for (let i = 0; i < arr.length; i++) {
            let line = arr[i];
            let splited = line.split("=");
            let key = splited[0].trim();
            let value = splited[1].trim();
            data[key] = value;
        }
        return data;
    }

    let data = {};
    let arr = info.split('\n');
    let type = "";
    for (let i = 0; i < arr.length; i++) {
        let line = arr[i];
        if (line.startsWith("#")) {
            type = line.split(" ")[1].trim().toLowerCase();
            data[type] = {};
        } else if (line.includes(":")) {
            let splited = line.split(":");
            let key = splited[0].trim();
            let value = splited[1].trim();
            if (value.includes(",")) {
                data[type][key] = innerValues(value);
            } else {
                data[type][key] = value;
            }
        }
    }
    return data;
}

app.get("/redisInfo", (req, res) => {
    if (isRedisReady()) {
        redis.info(function(err, result) {
            res.statusCode = 200;
            res.send(parseRedisInfo(result));
        });
    } else {
        res.statusCode = 200;
        res.send("Ikke kontakt med Redis cluster");
    }
});

app.get("/die", () => {
    server.close( () => {
        console.log('I am dying')
    })
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


const dummyCheck = (done) => {
    done(physical.response({
        name: 'Sample passing check',
        actionable: false,
        healthy: true,
        type: physical.type.SELF
    }));
};

const leaderCheck = (done) => {
    getLeaderName(function (statusCode, result) {
        if (statusCode == 200) {
            done(physical.response({
                name: 'Leader election check',
                actionable: false,
                healthy: true,
                message: result,
                type: physical.type.SELF
            }));
        } else {
            done(physical.response({
                name: 'Leader election check',
                actionable: false,
                healthy: false,
                message: result,
                severity: physical.severity.CRITICAL,
                type: physical.type.SELF
            }));
        }
    });
};

const envCheck = require("./lib/checks/environment.js");
const certCheck = require("./lib/checks/certfificate.js");
app.use('/healthcheck', physical([dummyCheck, envCheck.hasFasitEnvVariables, certCheck.checkCertificate, leaderCheck]));
