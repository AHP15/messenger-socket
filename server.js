import { Server } from "socket.io";
import { createServer } from "http";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  }
});

let isConnected = false;
async function connectDB() {
  const client = new MongoClient(process.env.CONNECTION_URL);
  if (isConnected) {
    console.log("database already connected");
    return client.db("chat");
  }

  try {
    await client.connect();
    isConnected = true;
    console.log("connected to database successfully");
  } catch (err) {
    console.error(err);
  }

  return client.db("chat");
}

io.on('connection', (socket) => {
  socket.on('user', (id) => {
    socket.join(id);
  });

  socket.on('typing', ({chatId, users}) =>{
    users.forEach(id => {
      socket.to(id).emit('typing-received', chatId);
    });
  });

  socket.on('typing-ended', ({chatId, users}) => {
    users.forEach(id => {
      socket.to(id).emit('typing-ended-reveived', chatId);
    });
  });

  socket.on('message', async ({chatId, users, message}) => {
    try {
      const DB = await connectDB();
      const Chat = DB.collection('chats');
      const chat = await Chat.updateOne({_id: new ObjectId(chatId)}, { $push: { messages: message } }).then(() => {
        users.forEach(id => {
          socket.to(id).emit('message-received', {chatId, message});
        });
      })
    } catch (err) {
      console.log(err);
    }
  });
});

io.listen(8081);
