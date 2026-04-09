import cors from 'cors';
import express from 'express';
import path from 'path';

import apiRoutes from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(process.cwd(), 'images')));
app.use(apiRoutes);

export default app;
