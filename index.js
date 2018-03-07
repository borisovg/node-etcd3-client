/*jshint node:true, esversion:6*/
'use strict';

/**
* @author George Borisov <git@gir.me.uk>
* @license LGPL-3.0
*/

const etcd = require('etcd3-rpc');
const grpc = require('grpc');

const clients = require('./lib/clients.js');

/**
 * [description]
 * @param  {string}     type     client type (e.g. KV)
 * @param  {object}     opts     options
 * @param  {function}   callback callback function (err, client)
 * @return {EtcdClient}          client instance
 */
exports.createClient = function (type, opts, callback) {
    if (!etcd[type]) {
        return process.nextTick(function () {
            callback(new Error('Unknown type'));
        });
    }

    opts = opts || {};
    opts.host = opts.host || '127.0.0.1';
    opts.port = opts.port || 2379;
    opts.maxWait = opts.maxWait || 5000;

    const creds = grpc.credentials.createInsecure(); // TODO: support authentication
    const client = (clients[type]) ? new clients[type](opts, creds) : new etcd[type](`${opts.host}:${opts.port}`, creds);

    grpc.waitForClientReady(client, new Date(Date.now() + opts.maxWait), function (err) {
        callback(err, client);
    });
};
