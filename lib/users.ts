import { User } from "./types";
import clientPromise from "./mongodb";

export const addUser = async (
  id: string,
  room: string,
  name: string,
  picture: string
) => {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("users");
  const existingUser = collection.find({ name, room });
  console.log("exisiting", await existingUser.toArray());
  const user = { id, name, picture, room };



  await collection.insertOne(user);
  return { id, name: user.name, picture: user.picture };
};

export const removeUser = async (id: string, roomId:string) => {
  console.log(id)
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("users");
  collection.deleteMany({ id, roomId });
};

// export const getUser = (id: string) => users.find((user) => user.id === id);

export const getUsersInRoom = async (room: string) => {
  // get users from mongodb
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("users").find({ room });
  return await collection.toArray();
};
