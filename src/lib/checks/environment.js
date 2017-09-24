const physical = require('express-physical');
const requiredEnvVars = ["testCredential_username", "testCredential_password", "a_testBaseurl_url"];

const checkEnvVariables = (data) => (done) => {
    if (requiredEnvVars.every((e) => {
            //todo Remove once all env vars are uppercased.
            return process.env[e] && process.env[e.toUpperCase()]
        })) {
        done(physical.response(Object.assign(data, {
            healthy: true,
            actionable: false,
        })));
    } else {
        done(physical.response(Object.assign(data, {
            healthy: false,
            actionable: false,
            severity: physical.severity.CRITICAL,
            message: "Required fasit resources not found: " + requiredEnvVars + ", " + requiredEnvVars.map(s => s.toUpperCase()),
            info: {
                info: "todo: Can write something useful here."
            }
        })));
    }
};

exports.hasFasitEnvVariables = checkEnvVariables({
    name: "FASIT resources are injected as ENV variables.",
    type: physical.type.EXTERNAL_DEPENDENCY,
    dependentOn: "FASIT"
});