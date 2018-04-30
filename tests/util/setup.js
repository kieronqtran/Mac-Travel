'use strict';
const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

expect(chai)();
chai.use(chaiAsPromised);
chai.use(sinonChai);
