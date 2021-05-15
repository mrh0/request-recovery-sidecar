const assert = require('assert');
require("dotenv").config();
process.env.TEST_FAIL = false;

function waitFor(ms) {
	return new Promise((resolve) => {
		let id = setTimeout(() => {
			clearTimeout(id);
			resolve();
		}, ms);
	});
}

describe('Recovery', () => {
    before(() => {
        const server = createServer(app);
        server.listen(process.env.TEST_PORT || 5000, () => {
            console.log(`Server listening on port ${process.env.TEST_PORT || 5000}`);
        });
    })
	describe('tests that saga step is created', () => {
		let saga = new Saga();
		it('should create a step with a name', () => {
			let step = saga.begin({name: "test"});
			assert.strictEqual(saga._entries[0], step);
			assert.strictEqual(saga._entries[0].getName(), "test");
		});
	});
});