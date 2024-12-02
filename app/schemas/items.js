const mongoose = require('mongoose');
const databaseConfig  = require(__path_configs + 'database');

const schema = new mongoose.Schema({ 
    name: String, 
    status: String,
    ordering: String
});
module.exports = mongoose.model(databaseConfig.col_items, schema);