const physical = require('express-physical');
const requiredEnvVars = ["TESTCREDENTIAL_USERNAME", "TESTCREDENTIAL_PASSWORD", "A_TESTBASEURL_URL"];

const checkEnvVariables = (data) => (done) => {
    if (requiredEnvVars.every((e) => {
            return process.env[e]
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
            message: "One or more of these required Vault resources not found: " + requiredEnvVars,
            info: {
                info: "todo: Can write something useful here."
            }
        })));
    }
};

exports.hasVaultEnvVariables = checkEnvVariables({
    name: "Vault resources are injected as ENV variables.",
    type: physical.type.EXTERNAL_DEPENDENCY,
    dependentOn: "VAULT"
});
