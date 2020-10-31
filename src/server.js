const app = require('./app');

const port = 3001;

const init = async () => {
  try {
    app.listen(port, () => {
      console.log(`Express App Listening on Port ${port}`);
    });
  } catch (error) {
    console.error(`An error occurred: ${JSON.stringify(error)}`);
    process.exit(1);
  }
};

init();