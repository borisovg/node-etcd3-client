/*jshint node:true, esversion:6*/
'use strict';

/**
* @author George Borisov <git@gir.me.uk>
* @license LGPL-3.0
*/

const etcd = require('etcd3-rpc');

const Watcher = require('./Watcher.js');
const utils = require('./utils.js');

class WatchClient extends etcd.Watch {
    constructor (opts, creds) {
        super(`${opts.host}:${opts.port}`, creds);

        this._createQueue = [];
        this._closed = false;
        this._stream = super.watch();
        this._opts = opts;
        this._watchers = new Map();

        // expose original methods just in case
        this._close = super.close;
        this._watch = super.watch;

        this._stream.on('error', (err) => {
            if (this._closed) { // this._stream.cancel() with cause an error to be emitted
                return;
            }

            for (let watcher of this._watchers.values()) {
                watcher.callback(err);
            }
        });

        this._stream.on('data', (data) => {
            if (data.created) {
                const watcher = this._createQueue.shift(); // this may be a race...

                watcher.id = data.watch_id;
                this._watchers.set(watcher.id, watcher);
                this._notify(watcher.id, data);

            } else if (data.canceled) {
                const id = data.watch_id;

                this._watchers.delete(id);

                if (this._closed && !this._watchers.size) {
                    this._end();
                }

            } else {
                this._notify(data.watch_id, data);
            }
        });
    }

    /**
     * @private
     */
    _end () {
        this._stream.cancel(); // https://github.com/coreos/etcd/issues/9391
        super.close();
    }

    /**
     * @private
     */
    _notify (id, data) {
        if (!data.events.length) {
            return;
        }

        const events = [];

        for (let i = 0; i < data.events.length; i += 1) {
            events.push(data.events[i].kv);

            if (data.events[i].prev_kv) {
                events.push(data.events[i].prev_kv);
            }
        }

        utils.decode(events);

        this._watchers.get(id).callback(undefined, data);
    }

    /**
     * Cancel all watchers and close client
     */
    close () {
        this._closed = true;

        if (!this._watchers.size) {
            return this._end();
        }

        for (let watcher of this._watchers.values()) {
            watcher.cancel();
        }
    }

    /**
     * Create a watcher
     * @param  {WatchCreateRequest} req      request object
     * @param  {Function}           callback callback function (err, WatchResponse)
     * @return {Function}                    function to cancel watcher
     */
    watch (req, callback) {
        const watcher = new Watcher(this._stream, req, callback);

        this._createQueue.push(watcher);

        return () => {
            watcher.cancel();
            this._watchers.delete(callback);
        };
    }
}

module.exports = WatchClient;
