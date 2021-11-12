const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');

require('dotenv').config();

const sequelize = require('./db');
const models = require('./models/models');
const router = require('./routes');
const errorHandler = require('./middleware/ErrorHandlingMiddleware');

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload({}));
app.use(express.static(path.resolve(__dirname, 'static')));

app.use('/api', router);

//Обработка ошибки последний, middleware
app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server listen on http://localhost:${PORT}`);
    })
  } catch(e) {
    console.error(e);
  }
}

start();