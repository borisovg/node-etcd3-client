/*jshint node:true, esversion:6*/
'use strict';

const etcd = require('etcd3-client');

etcd.createClient('KV', { host: 'localhost', port: 2379 }, function (err, client) {
    // put
    client.put({ key: 'foo', value: 'foo', prev_kv: true }, function (err, res) {
        console.log('PUT RESPONSE', res);

        // range
        client.range({ key: 'f', range_end: '' }, function (err, res) {
            console.log('RANGE RESPONSE', res);

            // deleteRange
            client.deleteRange({ key: 'f', range_end: 'g', prev_kv: true }, function (err, res) {
                console.log('DELETE-RANGE RESPONSE', res);
            });
        });
    });
});
