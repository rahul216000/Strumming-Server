const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
  // 'https://guitar-webapp.netlify.app'
]
}));

app.use(express.json())
app.use(require('./Router/AppFunctioanlity'));

app.listen(PORT, (error) => {
  if (!error) {
    console.log("Server is Successfully Running, and App is listening on port " + PORT)
  } else {
    console.log('Server not started ' + error);
  }

});

