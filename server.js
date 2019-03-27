const express = require("express");
const morgan = require("morgan");
const sqlite3 = require("sqlite3");
const bodyParser = require("body-parser");
const cors = require("cors");
const  errorHandler = require("errorhandler");
const apiRouter = require("./api/api.js");

const app = express();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const PORT = process.env.PORT || 4000


app.use(morgan("tiny"))
app.use(cors());
app.use (express.json());
app.use (express.static("public"))
app.use(express.urlencoded());
app.use(errorHandler());
app.use(bodyParser.json());


app.use('/api', apiRouter);


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})



module.exports = app;