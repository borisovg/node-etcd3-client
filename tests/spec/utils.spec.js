/*jshint node:true, esversion:6, mocha:true*/
'use strict';

/**
* @author George Borisov <git@gir.me.uk>
*/

const expect = require('chai').expect;
const utils = require('../../lib/utils.js');

describe('lib/utils.js', function () {
    it('encodes key in-place', function () {
        var o = { key: 'foo' };

        utils.encode(o);
        expect(o.key[0]).to.equal(0x66);
    });

    it('encodes empty key string as NULL character', function () {
        var o = { key: '' };

        utils.encode(o);
        expect(o.key.length).to.equal(1);
        expect(o.key[0]).to.equal(0x00);
    });

    it('ignores undefined key', function () {
        var o = { key: undefined };

        utils.encode(o);
        expect(o.key).to.equal(undefined);
    });

    it('encodes value in-place', function () {
        var o = { value: 'foo' };

        utils.encode(o);
        expect(o.value[0]).to.equal(0x66);
    });

    it('encodes value of type "object" as JSON', function () {
        var o = { value: { foo: 'bar' } };

        utils.encode(o);
        expect(JSON.parse(o.value).foo).to.equal('bar');
    });

    it('decodes key given an array of KV pairs', function () {
        var a = [{ key: new Buffer('foo') }];

        utils.decode(a);
        expect(a[0].key).to.equal('foo');
    });

    it('decodes value given an array of KV pairs', function () {
        var a = [{ value: new Buffer('foo') }];

        utils.decode(a);
        expect(a[0].value).to.equal('foo');
    });
});
