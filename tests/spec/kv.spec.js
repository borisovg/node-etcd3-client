/*jshint node:true, mocha:true*/
'use strict';

/**
* @author George Borisov <git@gir.me.uk>
*/

var expect = require('chai').expect;
var lib = require('../../index.js');

describe('KV client', function () {
    var client;

    it('creates client with default options', function (done) {
        lib.createClient('KV', {}, function (err, c) {
            expect(err).to.equal(undefined);
            expect(typeof c.deleteRange).to.equal('function');
            expect(typeof c.put).to.equal('function');
            expect(typeof c.range).to.equal('function');

            client = c;
            done();
        });
    });

    it('creates KV pairs', function (done) {
        client.put({ key: 'test/foo', value: 'foo' }, function (err, res) {
            expect(err).to.equal(undefined);
            expect(typeof res.header).to.equal('object');

            client.put({ key: 'test/bar', value: 'barbar' }, function (err, res) {
                expect(typeof res.header).to.equal('object');
                done();
            });
        });
    });

    it('put honours prev_kv', function (done) {
        client.put({ key: 'test/foo', value: 'foofoo', prev_kv: true }, function (err, res) {
            expect(err).to.equal(undefined);
            expect(res.prev_kv.key).to.equal('test/foo');
            expect(res.prev_kv.value).to.equal('foo');
            done();
        });
    });

    it('gets single KV pair', function (done) {
        client.range({ key: 'test/foo' }, function (err, res) {
            expect(err).to.equal(undefined);
            expect(res.kvs.length).to.equal(1);
            expect(res.kvs[0].value).to.equal('foofoo');
            done();
        });
    });

    it('gets range of KV pairs', function (done) {
        client.range({ key: 'test/', range_end: '' }, function (err, res) {
            expect(err).to.equal(undefined);
            expect(res.kvs.length).to.equal(2);
            expect(res.kvs[0].value).to.equal('barbar');
            expect(res.kvs[1].value).to.equal('foofoo');
            done();
        });
    });

    it('deletes a single KV pair', function (done) {
        client.deleteRange({ key: 'test/foo' }, function (err, res) {
            expect(err).to.equal(undefined);
            expect(res.deleted).to.equal('1');

            client.range({ key: 'test/foo' }, function (err, res) {
                expect(err).to.equal(undefined);
                expect(res.kvs.length).to.equal(0);
                done();
            });
        });
    });

    it('deleteRange honours prev_kv option', function (done) {
        client.put({ key: 'test/foo', value: 'foofoo' }, function () {
            client.deleteRange({ key: 'test/foo', prev_kv: true }, function (err, res) {
                expect(err).to.equal(undefined);
                expect(res.prev_kvs.length).to.equal(1);
                expect(res.prev_kvs[0].value).to.equal('foofoo');
                done();
            });
        });
    });

    it('deletes a range of KV pairs', function (done) {
        client.deleteRange({ key: 'test/a', range_end: 'test/z' }, function (err, res) {
            expect(err).to.equal(undefined);
            expect(res.deleted).to.equal('1');

            client.range({ key: 'test', range_end: '' }, function (err, res) {
                expect(err).to.equal(undefined);
                expect(res.kvs.length).to.equal(0);
                done();
            });
        });
    });
});
