/**
 * Chofer.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q');
var bcrypt = require('bcrypt');

module.exports = {
    attributes: {
        chofer: {
            model: 'chofer'
        },
        auto: {
            model: 'auto'
        }

    }
};
