const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const dotenv = require("dotenv");
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");

dotenv.config({ path: './config.env' });

app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
  'https://guitar-webapp.netlify.app'
]
}));

app.use(express.json())
app.use(cookieParser())
app.set("view engine", "ejs");

const DB = process.env.DATABASE;
mongoose.set("strictQuery", false);
mongoose.connect(DB).then(() => {
    console.log('Connected');
}).catch((e) => { console.log('Not connected' + e); })

app.use(require('./Router/AppFunctioanlity'));
app.use(require('./Router/Users'));
app.use(require('./Router/SongDataAPI'));
app.use(require('./Router/DashboardAPIs'));

app.listen(PORT, (error) => {
  if (!error) {
    console.log("Server is Successfully Running, and App is listening on port " + PORT)
  } else {
    console.log('Server not started ' + error);
  }
});

