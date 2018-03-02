const physical = require('express-physical');
const requiredCertifcates = ["testCertificate_keystore", "testCertificate2_keystore"];
const fs = require('fs');
const mountPath = "/var/run/secrets/naisd.io/";

const checkCertifcates = (data) => (done) => {
    if (requiredCertifcates.every((f) => {
            return fs.existsSync(mountPath + f)
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
            message: "Required fasit resources not found in path " + mountPath + ": " + requiredCertifcates,
            info: {
                info: "todo: Can write something useful here."
            }
        })));
    }
};

exports.checkCertificate = checkCertifcates({
    name: "FASIT certificates are injected as file secrets.",
    type: physical.type.EXTERNAL_DEPENDENCY,
    dependentOn: "FASIT"
});