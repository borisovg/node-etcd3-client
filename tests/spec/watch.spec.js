/*jshint node:true, esversion:6, mocha:true*/
'use strict';

/**
* @author George Borisov <git@gir.me.uk>
*/

const expect = require('chai').expect;
const lib = require('../../index.js');

describe('Watch client', function () {
    var client, cancel, kv;

    before(function (done) {
        kv = lib.createClient('KV', undefined, function (err, client) {
            expect(err).to.equal(undefined);
            kv = client;
            done();
        });
    });

    after(function () {
        kv.close();
    });

    it('creates client with default options', function (done) {
        lib.createClient('Watch', {}, function (err, c) {
            expect(err).to.equal(undefined);
            expect(typeof c.close).to.equal('function');
            expect(typeof c.watch).to.equal('function');

            client = c;
            done();
        });
    });

    it('creates a watcher', function (done) {
        cancel = client.watch({ key: 'e', range_end: 'g' }, function (err, data) {
            expect(err).to.equal(undefined);
            expect(data.events.length).to.equal(1);
            expect(data.events[0].type).to.equal('PUT');
            expect(data.events[0].kv.key).to.equal('foo');
            expect(data.events[0].kv.value).to.equal('foofoo');
            done();
        });

        kv.put({ key: 'foo', value: 'foofoo' });
    });

    it('cancels watcher', function () {
        cancel();
    });

    it('notifies watcher of stream errors', function (done) {
        cancel = client.watch({ key: 'foo' }, function (err, data) {
            expect(err).to.equal('spanner');
            expect(data).to.equal(undefined);
            cancel();
            done();
        });

        setTimeout(function () {
            client._stream.emit('error', 'spanner');
        }, 10);
    });

    it('creates a watcher with "prev_kv" set', function (done) {
        cancel = client.watch({ key: 'foo', prev_kv: true }, function (err, data) {
            expect(err).to.equal(undefined);
            expect(data.events.length).to.equal(1);
            expect(data.events[0].type).to.equal('PUT');
            expect(data.events[0].kv.key).to.equal('foo');
            expect(data.events[0].kv.value).to.equal('foobar');
            expect(data.events[0].prev_kv.key).to.equal('foo');
            expect(data.events[0].prev_kv.value).to.equal('foofoo');
            cancel();
            done();
        });

        kv.put({ key: 'foo', value: 'foobar' });
    });

    it('supports multiple watchers', function (done) {
        var semaphore = 3;

        function cb1 (err, data) {
            semaphore -= 1;

            expect(semaphore).to.be.above(-1);
            expect(err).to.equal(undefined);
            expect(data.events.length).to.equal(1);
            expect(data.events[0].type).to.equal('PUT');
            expect(data.events[0].kv.key).to.equal('foo');
            expect(data.events[0].kv.value).to.equal('foofoo');

            if (!semaphore) {
                done();
            }
        }

        function cb2 (err, data) {
            semaphore -= 1;

            expect(semaphore).to.be.above(-1);
            expect(err).to.equal(undefined);
            expect(data.events.length).to.equal(1);
            expect(data.events[0].type).to.equal('PUT');
            expect(data.events[0].kv.key).to.equal('bar');
            expect(data.events[0].kv.value).to.equal('barbar');

            if (!semaphore) {
                done();
            }
        }

        client.watch({ key: 'foo' }, cb1);
        client.watch({ key: 'bar' }, cb2);
        client.watch({ key: 'bar' }, cb2);

        setTimeout(function () {
            kv.put({ key: 'foo', value: 'foofoo' });
            kv.put({ key: 'bar', value: 'barbar' });
        }, 10);
    });

    it('cancels watchers and closes client', function () {
        client.close();
    });

    it('closes client with no watchers', function (done) {
        lib.createClient('Watch', {}, function (err, client) {
            client.close();
            done();
        });
    });
});
