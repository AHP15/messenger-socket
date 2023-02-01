import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  }
});

io.on('connection', (socket) => {
  socket.on('user', (id) => {
    console.log(id);
    socket.join(id);
  });

  socket.on('typing', ({chatId, users}) =>{
    users.forEach(id => {
      socket.to(id).emit('typing-received', chatId);
    })
  });
});

io.listen(8081);
