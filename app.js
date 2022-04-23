const express = require('express');
const app = express();
// const router = express.Router();
const path = require('path');
const mongoose = require('mongoose');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const PORT = process.env.PORT;


const MONGO_URI = process.env.MONGO_URI;

const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const mp3_Routes = require('./routes/mp3');
const angularRoutes = require('./routes/angular');
const playlistRoutes = require('./routes/playlist');
const bodyParser = require('body-parser');




const store = new MongoDBStore({
    uri: MONGO_URI,
    databaseName: 'musicPlayer',
    collection: 'sessions'
});

store.on('error', error => {
    console.log(error);
})

app.use(function(req, res, next) {

    res.setHeader('Access-Control-allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-allow-Methods', 'GET, POST, OPTIONS, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');


    next();
});
app.set('view engine', 'pug');
app.set('views', 'views');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views', 'client')));

app.use(session({ secret: 'secret', resave: false, saveUninitialized: false, store: store }));


// app.use((req, res, next) => {
//     User.findById('61f199bb7258a20dce2e21a6').then(user => {
//         req.user = user;
//         next();
//     }).catch(err => console.log(err));
//     next();
// });



app.use('/auth', authRoutes);
app.use('/admin', adminRoutes.routes);
app.use(mp3_Routes);
app.use(playlistRoutes);

app.use(angularRoutes);

mongoose.connect(MONGO_URI).then(() => {
    if (PORT == null || PORT == "") {
        app.listen(3000);
    } else {
        app.listen(PORT, () => {
            console.log('App listening on port: ' + PORT);
        });
    }

    console.log('Connected');
}).catch(error => {
    console.log(error);
});
