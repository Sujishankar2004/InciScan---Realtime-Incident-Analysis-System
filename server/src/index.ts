import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

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

// ML Service Process Management
let mlServiceProcess: ChildProcess | null = null;

const startMLService = () => {
    const mlServicePath = path.join(__dirname, '../../ml_service');

    console.log('🚀 Starting ML service...');
    console.log('📂 ML service path:', mlServicePath);

    mlServiceProcess = spawn('python', ['main.py'], {
        cwd: mlServicePath,
        stdio: ['pipe', 'pipe', 'pipe'], // Capture stdout and stderr
        shell: true
    });

    // Handle ML service output
    mlServiceProcess.stdout?.on('data', (data) => {
        console.log(`[ML Service] ${data.toString().trim()}`);
    });

    mlServiceProcess.stderr?.on('data', (data) => {
        console.error(`[ML Service Error] ${data.toString().trim()}`);
    });

    mlServiceProcess.on('error', (err) => {
        console.error('❌ Failed to start ML service:', err.message);
        console.log('💡 Make sure Python and required packages are installed');
    });

    mlServiceProcess.on('exit', (code, signal) => {
        console.log(`⚠️  ML service exited with code ${code} (signal: ${signal})`);

        // Auto-restart on crash (but not on manual termination)
        if (code !== 0 && signal !== 'SIGTERM') {
            console.log('🔄 Restarting ML service in 3 seconds...');
            setTimeout(startMLService, 3000);
        }
    });

    return mlServiceProcess;
};

// Cleanup function for graceful shutdown
const cleanup = () => {
    console.log('\n🛑 Shutting down InciScan server...');

    if (mlServiceProcess) {
        console.log('🔌 Stopping ML service...');
        mlServiceProcess.kill('SIGTERM');
        mlServiceProcess = null;
    }

    httpServer.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });

    // Force exit if cleanup takes too long
    setTimeout(() => {
        console.error('⚠️  Forced shutdown');
        process.exit(1);
    }, 5000);
};

// Handle shutdown signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`✅ InciScan Server is running on port ${PORT}`);
    console.log(`📡 Socket.IO ready for real-time updates`);
    console.log('');

    // Start ML service after server is up
    setTimeout(() => {
        startMLService();
    }, 1000);
});
