var config = module.exports = {};

config.database = 'mongodb://localhost:27017/naf';
config.apiPrefix = '/api/v1';
config.port = 8000;

config.jwt = {
    secret: '0np^28roi@wrar_6',
    expiration: 3600
};

config.zoom = {
    apiPrefix: 'https://api.zoom.us/v1',
    apiKey: 'Wio4xSnNSo6IPfg6uO1pxA',
    apiSecret: 'mMSIrxBfaTPhZDxlHR3QaotP788FU4s5smyz',
    accessToken: 'yVAaN8f4FnuoRwIpphuCDiosytGwNP3hVI88',
    hostId: 'uLa29ShaTjiEXFKztw7cBA'
};

config.pagination = {
    limit: 2
};

config.zoomLimit = 15;