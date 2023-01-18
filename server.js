import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  }
});

io.on('connection', (socket) => {
  socket.on('user', (email) => {
    socket.join(email);
  });
});
