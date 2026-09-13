require('dotenv').config({ quiet: true });

const app = require('./app');

const port = Number(process.env.PORT) || 3333;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
