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
    apiKey: 'r_ZHf8ibRO-LXeDpf3lSxQ',
    apiSecret: 'YwQp52jONzzwCF6hy78jPyoA7JaswtyyikQf',
    accessToken: 'WYnpXZqwsmGjNiexXpU17H11Myzj9xfQeOJ7',
    hostId: '9zBPilvdQvWNDqpMIZfCCg'
};