import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
    cors: {
        origin: "*", // Configure this in production
        methods: ["GET", "POST"]
    }
});

import incidentRoutes from './routes/incidents';

app.use(cors());
app.use(express.json());

app.use('/api/incidents', incidentRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('InciScan API is running');
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
