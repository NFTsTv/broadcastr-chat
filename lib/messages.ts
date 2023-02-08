import { v4 as uuidv4 } from 'uuid';
import { Message, MessageData } from "./types";
import clientPromise from "./mongodb";

// const messages: Message[] = [];

export const addMessage = async (room: string, message: MessageData) => {
  console.log("adding message", message);
  const msg = { id: uuidv4(), room, ...message, sentAt: Date.now() };
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("messages");
  await collection.insertOne(msg);
  return msg;
};

// export const removeMessage = (id: string) => {
//   const index = messages.findIndex((message) => message.id === id);

//   if (index !== -1) return messages.splice(index, 1)[0];
// };

// export const getMessage = (id: string) => messages.find((message) => message.id === id);

// export const getMessagesInRoom = (room: string) =>
//   messages.filter((message) => message.room === room);

export const getMessagesInRoom = async (room: string) => {
  // get messages from mongodb
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("messages").find({ room });
  const messages = await collection.toArray();
  console.log(messages);
  return messages;
};
