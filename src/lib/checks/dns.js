const physical = require('express-physical');
const request = require('request');
const testUrl ="nais-testapp.default";

const lookupSelf = (data) => (done) => {

    request.get(testUrl,(err, response) => {
        if (!err && response.statusCode === 200) {
            done(physical.response(Object.assign(data, {
                healthy: true,
            })))

        } else {
            done(physical.response(Object.assign(data, {
                healthy: false,
                severity: physical.severity.CRITICAL,
                message:  "Unable to GET " +  testUrl
            })))
        }
    });
};

exports.checkDns = lookupSelf({
    name: "Able to resolve DNS service name",
    actionable: false,
    type: physical.type.INFRASTRUCTURE,
    dependentOn: "SkyDNS, Kube API Server"
});