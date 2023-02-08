import { Server } from 'socket.io';
import { addUser, removeUser } from '@/lib/users'
import { addMessage } from '@/lib/messages';
import { USER_JOIN_CHAT_EVENT, 
         USER_LEAVE_CHAT_EVENT, 
         NEW_CHAT_MESSAGE_EVENT, 
         START_TYPING_MESSAGE_EVENT, 
         STOP_TYPING_MESSAGE_EVENT } from '@/lib/eventconst';
import type { NextApiRequest, NextApiResponse } from 'next';

function ioHandler(req: NextApiRequest, res: NextApiResponse) {
    if (!(res.socket as any).server.io) {
        console.log('*First use, starting socket.io');
    
        const io = new Server((res.socket as any).server);
        
        io.on('connection', async socket => {
          console.log(`${socket.id} connected`);

          // Join a conversation
          const { roomId, name, picture, password } = socket.handshake.query;
          socket.join(roomId as string);
        
          const user = await addUser(password as string, roomId as string, name as string, picture as string);
          console.log(`${user.name} joined room ${roomId}`);
          io.in(roomId as string).emit(USER_JOIN_CHAT_EVENT, user);
        
          // Listen for new messages
          socket.on(NEW_CHAT_MESSAGE_EVENT, async (data) => {
            const message = await addMessage(roomId as string, data);
            io.in(roomId as string).emit(NEW_CHAT_MESSAGE_EVENT, message);
          });

          // Listen typing events
          socket.on(START_TYPING_MESSAGE_EVENT, (data) => {
            io.in(roomId as string).emit(START_TYPING_MESSAGE_EVENT, data);
          });
          socket.on(STOP_TYPING_MESSAGE_EVENT, (data) => {
            io.in(roomId as string).emit(STOP_TYPING_MESSAGE_EVENT, data);
          });

          // Leave the room if the user closes the socket
          socket.on("disconnect", () => {
            removeUser(password as string, roomId as string);
            io.in(roomId as string).emit(USER_LEAVE_CHAT_EVENT, user);
            socket.leave(roomId as string);
          });
        });
    
        (res.socket as any).server.io = io;
    } else {
        console.log('socket.io already running');
    }
    res.end();
}

export const config = {
    api: {
      bodyParser: false
    }
}

export default ioHandler;
