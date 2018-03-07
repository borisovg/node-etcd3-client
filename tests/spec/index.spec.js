/*jshint node:true, esversion:6, mocha:true*/
'use strict';

/**
* @author George Borisov <git@gir.me.uk>
*/

const expect = require('chai').expect;
const lib = require('../../index.js');

describe('index.js', function () {
    it('exports createClient function', function () {
        expect(typeof lib.createClient).to.equal('function');
    });

    it('returns an error for an unknown client type', function (done) {
        lib.createClient('spanner', undefined, function (err) {
            expect(err.message).to.equal('Unknown type');
            done();
        });
    });
});
