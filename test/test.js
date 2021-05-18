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
            process.env.MAX_RETRIES = "1";
			request("flag", {}).then(async () => {
                assert.strictEqual(flag.get(), 0);
                await recover();
                await waitFor(1000);
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
            process.env.MAX_RETRIES = "1";
			request("flag", {}).then(async () => {
                assert.strictEqual(flag.get(), 0);
                process.env.TEST_FAIL = "false";
                await recover();
                await waitFor(1000);
                try {
                    assert.strictEqual(await getLen(process.env.NAME), 0);
                    assert.strictEqual(flag.get(), 1);
                    done();
                }
                catch(e) {done(e)}
            });
		});

        it('Multiple (20) request was unsuccessful but then successfully recovered with batching (5)', function (done) {
            this.timeout(10000);
            process.env.TEST_FAIL = "true";
            process.env.MAX_RETRIES = "1";
            process.env.RECOVER_BATCH = "5";
            let req = [];
            const num = 20;
            for(i = 0; i < num; i++)
                req.push(request("flag", {}))
            
			Promise.all(req).then(async () => {
                assert.strictEqual(flag.get(), 0);
                process.env.TEST_FAIL = "false";
                await recover();
                await waitFor(1000);
                try {
                    assert.strictEqual(await getLen(process.env.NAME), 0);
                    assert.strictEqual(flag.get(), num);
                    done();
                }
                catch(e) {done(e)}
            });
		});

        it('Multiple (20) request was unsuccessful and recovery fail once then succeedes', function (done) {
            this.timeout(10000);
            process.env.TEST_FAIL = "true";
            process.env.MAX_RETRIES = "3";
            process.env.RECOVER_BATCH = "5";
            let req = [];
            const num = 20;
            for(i = 0; i < num; i++)
                req.push(request("flag", {}))
            
			Promise.all(req).then(async () => {
                assert.strictEqual(flag.get(), 0);
                await recover();
                await waitFor(1000);
                try {
                    assert.strictEqual(await getLen(process.env.NAME), num);
                    assert.strictEqual(flag.get(), 0);
                    done();
                }
                catch(e) {done(e)}

                process.env.TEST_FAIL = "false";

                await recover();
                await waitFor(1000);
                try {
                    assert.strictEqual(await getLen(process.env.NAME), 0);
                    assert.strictEqual(flag.get(), num);
                    done();
                }
                catch(e) {done(e)}
            });
		});
	});
});