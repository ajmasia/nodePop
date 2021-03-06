'use strict';

/**
 * Ad model data
 */

 // Require mongoose library
const mongoose = require('mongoose');
const fs = require('fs');

// Define ad schema
const adSchema = mongoose.Schema({
    name: { type: String, index: true },
    forSale: { type: Boolean, index: true },
    price: { type: Number, index: true },
    image: String,
    tags: { type: [String], index: true }
});

/**
 * Statics methods
 */

// Ads list method
adSchema.statics.list = function (filter, skip, limit, sort, fields, callback) {
    
    // get query whithout execute it
    const query = Ad.find(filter);
    
    // get query parameters 
    query.skip(skip);
    query.limit(limit);
    query.sort(sort);
    query.select(fields);
    
    // return execute query
    return query.exec(callback);
}

// Load json with new data
adSchema.statics.loadJson = async function (file) {
  
    // Using a callback function with async/await
    const data = await new Promise((resolve, reject) => {
      // Encodings: https://nodejs.org/api/buffer.html
      fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
        return err ? reject(err) : resolve(data);
      });
    });
  
    console.log('Done: File readed');
  
    if (!data) {
      throw new Error(file + ' is empty!');
    }
  
    const ads = JSON.parse(data).ads;
    const adsCount = ads.length;
  
    for (var i = 0; i < ads.length; i++) {
      await (new Ad(ads[i])).save();
    }
  
    return adsCount;
  
};
  
// Create model
const Ad = mongoose.model('Ad', adSchema);

// Expor model
module.exports = Ad;
