import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve index.html for all routes to support client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 3010;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
