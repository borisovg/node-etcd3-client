/*jshint node:true, esversion:6*/
'use strict';

/**
* @author George Borisov <git@gir.me.uk>
* @license LGPL-3.0
*/

const utils = require('./utils.js');

/**
 * @private
 */
class Watcher {
    constructor (stream, req, callback) {
        this.callback = callback;
        this.id = -1;
        this.req = req;
        this.stream = stream;

        utils.encode(req);
        this.stream.write({ create_request: req });
    }

    cancel () {
        this.stream.write({ cancel_request: { watch_id: this.id } });
    }
}

module.exports = Watcher;
