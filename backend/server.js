require('dotenv').config();
const app = require('./src/App'); 

const PORT = process.env.PORT || 10000; // Alinhado com a porta padrão do Render

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[🚀 Server] Rodando em modo seguro na porta ${PORT}`);
});