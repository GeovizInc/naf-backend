var config = module.exports = {};

config.database = 'mongodb://localhost:27017/naf';
config.apiPrefix = '/api/v1';
config.port = 8000;

config.jwt = {
    secret: 'smdskp#$ds,mfd)',
    expiration: 3600
};