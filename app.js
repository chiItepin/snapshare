const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const routes = require('./routes');

require('dotenv').config();

mongoose.connect(`mongodb+srv://superadmin:${process.env.MONGO_PASSWORD}@cluster0.7jmty.mongodb.net/Cluster0?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
)
    .then(() => console.log('Database connected successfully'))
    .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());

// Define request response in root URL (/)
app.get('/', (req, res) => {
  res.send('<b>Hello World!</b>');
});

app.use('/api', routes);

// Launch listening server on port 8080
const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
server.timeout = 10000;
