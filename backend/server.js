// backend/server.js
const app = require('./src/app');
const db = require('./src/config/database');

const PORT = process.env.PORT || 5001;


app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
