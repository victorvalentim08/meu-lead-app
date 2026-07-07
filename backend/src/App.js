const express = require('express');
const cors = require('cors');
const leadRoutes = require('./routes/leadRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Injeção de Rotas com versionamento de API (excelente se você for comercializar)
app.use('/api/v1', leadRoutes);

module.exports = app;