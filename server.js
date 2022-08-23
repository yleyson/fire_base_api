
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// import our current configuration
const PORT = process.env.PORT || 5008;

// set up our app using express
const server = express();
// express setup
server.use(express.json());
server.use(cors());
server.use(helmet()); //more defense
server.use(express.urlencoded({ extended: true }));

server.use('/api', require('./controllers/api_controller'))

server.listen(PORT, () => {
    console.log(`app listening at http://localhost:${PORT}`)
});

