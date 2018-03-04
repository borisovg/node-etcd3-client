/*jshint node:true, esversion:6*/
'use strict';

/**
* @author George Borisov <git@gir.me.uk>
* @license LGPL-3.0
*/

exports.encode = function (req) {
    if (req.key !== undefined) {
        if (req.key === '') {
            req.key = '\0';
        }

        req.key = new Buffer(req.key);
    }

    if (req.range_end !== undefined) {
        if (req.range_end === '') {
            req.range_end = '\0';
        }

        req.range_end = new Buffer(req.range_end);
    }

    if (req.value !== undefined) {
        if (typeof req.value === 'object') {
            req.value = new Buffer(JSON.stringify(req.value));
        } else {
            req.value = new Buffer('' + req.value);
        }
    }
};

exports.decode = function (kvs) {
    for (let i = 0; i < kvs.length; i += 1) {
        if (kvs[i].key) {
            kvs[i].key = kvs[i].key.toString();
        }

        if (kvs[i].value) {
            kvs[i].value = kvs[i].value.toString();
        }
    }
};
