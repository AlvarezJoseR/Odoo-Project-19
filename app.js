const express = require('express')
const app = express()
app.use(express.json());
require('dotenv').config();

//Imports routes
const utilRoutes = require('./Routes/util.routes');

//app config
const port = process.env.PORT;

//Routes
app.use('/util', utilRoutes);

app.listen(port, () => {
  console.log(`app listening on port ${port} ✅`)
})