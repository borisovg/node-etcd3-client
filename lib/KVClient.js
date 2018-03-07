/*jshint node:true, esversion:6*/
'use strict';

/**
* @author George Borisov <git@gir.me.uk>
* @license LGPL-3.0
*/

const etcd = require('etcd3-rpc');
const utils = require('./utils.js');

class KVClient extends etcd.KV {
    constructor (opts, creds) {
        super(`${opts.host}:${opts.port}`, creds);

        // expose original methods in case buffers are desired
        this._deleteRange = super.deleteRange;
        this._put = super.put;
        this._range = super.range;
    }

    /**
     * Delete range
     * @param  {DeleteRangeRequest} req        request object
     * @param  {Function}           [callback] optional callback function (err, DeleteRangeResponse)
     */
    deleteRange (req, callback) {
        utils.encode(req);

        super.deleteRange(req, function (err, res) {
            if (!callback) {
                return;
            } else if (res) {
                utils.decode(res.prev_kvs);
            }

            callback(err, res);
        });
    }

    /**
     * Insert or update key
     * @param  {PutRequest} req        request object
     * @param  {Function}   [callback] optional callback function (err, PutResponse)
     */
    put (req, callback) {
        utils.encode(req);

        super.put(req, function (err, res) {
            if (!callback) {
                return;
            } else if (res.prev_kv) {
                utils.decode([res.prev_kv]);
            }

            callback(err, res);
        });
    }

    /**
     * Get range of keys
     * @param  {RangeRequest} req      request object
     * @param  {Function}     callback callback function (err, RangeResponse)
     */
    range (req, callback) {
        utils.encode(req);

        super.range(req, function (err, res) {
            if (res) {
                utils.decode(res.kvs);
            }

            callback(err, res);
        });
    }
}

module.exports = KVClient;
