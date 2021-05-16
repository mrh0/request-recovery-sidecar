const assert = require('assert');
const fetch = require('node-fetch')
const flag = require('./flag')
const app = require('./routes')
const {getLen} = require("../src/recover");
const {createServer} = require("http");
require("dotenv").config();
process.env.TEST_FAIL = "false";

function waitFor(ms) {
	return new Promise((resolve) => {
		let id = setTimeout(() => {
			clearTimeout(id);
			resolve();
		}, ms);
	});
}

function request(to, body) {
    return fetch("http://localhost:"+process.env.PORT+"/"+to, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(body)});
}

function recover() {
    return fetch("http://localhost:"+process.env.CONTROL_PORT+"/recover", {method: "GET", headers: {"Content-Type": "application/json"}});
}

describe('Recovery', () => {
    before(() => {
        require("../index")

        const server = createServer(app);
        server.listen(process.env.TEST_PORT || 5000, () => {
            console.log(`Server listening on port ${process.env.TEST_PORT || 5000}`);
        });
    })

	describe('Testing recovery', () => {
        beforeEach(() => flag.reset());

		it('Single request was successful', function (done) {
            this.timeout(10000);
			request("flag", {}).then(() => {
                try {
                    assert.strictEqual(flag.get(), 1);
                    done();
                }
                catch(e) {done(e)}
            });
		});

        it('Single request was unsuccessful and discarded', function (done) {
            this.timeout(10000);
            process.env.TEST_FAIL = "true";
            process.env.MAX_RETRIES = "1"
			request("flag", {}).then(async () => {
                assert.strictEqual(flag.get(), 0);
                await recover();
                await waitFor(1000);
                console.log("waited");
                try {
                    assert.strictEqual(await getLen(process.env.NAME), 0);
                    assert.strictEqual(flag.get(), 0);
                    done();
                }
                catch(e) {done(e)}
            });
		});

        it('Single request was unsuccessful but then successfully recovered', function (done) {
            this.timeout(10000);
            process.env.TEST_FAIL = "true";
            process.env.MAX_RETRIES = "1"
			request("flag", {}).then(async () => {
                assert.strictEqual(flag.get(), 0);
                process.env.TEST_FAIL = "false";
                await recover();
                await waitFor(1000);
                console.log("waited");
                try {
                    assert.strictEqual(await getLen(process.env.NAME), 0);
                    assert.strictEqual(flag.get(), 1);
                    done();
                }
                catch(e) {done(e)}
            });
		});

        /*it('Single request was unsuccessful', function (done) {
            this.timeout(5000);
            process.env.TEST_FAIL = "true";
			request("flag", {}).then(() => {
                assert.strictEqual(flag.get(), 0);
                done();
            });
		});*/
	});
});