const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const uri = 'mongodb+srv://Maxx:w290982w@cluster0.g4fqe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

let _db;
let _client;

const connectMongo = callback => {
    MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(client => {
        console.log('Connected');
        _client = client;
        _db = client.db('musicPlayer');
        
        callback();
    }).catch(error => {
        console.log(error);

        throw error;
    });
    
};

const getClient = () => {
    
    if(_client) {
        return _client;
    }
    throw 'ERROR';
}

const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'ERROR';
    
}


exports.connectMongo = connectMongo;
exports.getDb = getDb;
exports.getClient = getClient;