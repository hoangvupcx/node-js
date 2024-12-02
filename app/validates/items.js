
const notify          = require(__path_configs + 'notify');
const util            = require('util');
const options = {
    name: {min: 5, max: 20},
    ordering: {min: 0, max: 100},
    status: {value: 'default'}
};

module.exports = {
    validator: (req) => {
        req.checkBody('name'      , util.format(notify.ERROR_NAME, options.name.min, options.name.max)).isLength({min: options.name.min, max: options.name.max});
        req.checkBody('ordering'  , `must be a number greater ${options.name.min}`).isInt({gt: 0});
        req.checkBody('status'    , 'is required').isNotEqual('default');
    } 
}