import type { NextApiRequest } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export const config = { api: { bodyParser: false } };

export default function handler(req: NextApiRequest, res: any) {
  if (!(res.socket as any).server.io) {
    const httpServer: NetServer = (res.socket as any).server as any;
    const io = new SocketIOServer(httpServer, { cors: { origin: '*'} });
    (res.socket as any).server.io = io;
    // expose globally so other API routes can emit
    ;(global as any).io = io;
    io.on('connection', (socket) => {
      const role = (socket.handshake.query?.role as string) || 'guest';
      socket.join(`role:${role}`);
      socket.on('disconnect', () => {});
    });
  }
  res.end();
}


