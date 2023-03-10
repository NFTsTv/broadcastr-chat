import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { UserData, User, TypingInfo, Message } from "./types";

import {
  USER_JOIN_CHAT_EVENT,
  USER_LEAVE_CHAT_EVENT,
  NEW_CHAT_MESSAGE_EVENT,
  START_TYPING_MESSAGE_EVENT,
  STOP_TYPING_MESSAGE_EVENT,
} from "./eventconst";

export default function useChat(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const [user, setUser] = useState<UserData>();
  const socketRef = useRef<any>();

  useEffect(() => {
    // const fetchUser = async () => {
    //   const response = await axios.get("https://api.randomuser.me/");
    //   const result = response.data.results[0];
    //   setUser({
    //     name: result.name.first,
    //     picture: result.picture.thumbnail,
    //   });
    // };
    // fetchUser();
  }, []);
  const fetchUsers = async () => {
    const response = await axios.get(`/api/rooms/${roomId}/users`);
    const result = response.data.users;
    setUsers(result);
    console.log(users);
  };
  useEffect(() => {
    fetchUsers();
  }, [roomId]);

  useEffect(() => {
    console.log(users);
  }, [users]);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await axios.get(`/api/rooms/${roomId}/messages`);
      const result = response.data.messages;
      setMessages(
        result.map((message: Message) => {
          return {
            ...message,
            ownedByCurrentUser: message.senderId === user?.password,
          };
        })
      );
    };
    if (user) {
      fetchMessages();
    }
  }, [roomId, user]);

  useEffect(() => {
    if (!user) {
      return;
    }
    fetch("/api/socketio").finally(() => {
      socketRef.current = io({
        query: {
          roomId,
          name: user.name,
          picture: user.picture,
          password: user.password,
        },
      });

      socketRef.current.on("connect", () => {
        console.log(user.password);
      });

      socketRef.current.on(USER_JOIN_CHAT_EVENT, (user: User) => {
        fetchUsers();
      });

      socketRef.current.on(USER_LEAVE_CHAT_EVENT, (user: User) => {
        fetchUsers();
      });

      socketRef.current.on(NEW_CHAT_MESSAGE_EVENT, (message: Message) => {
        const incomingMessage = {
          ...message,
          ownedByCurrentUser: message.senderId === user.password,
        };
        setMessages((messages) => [...messages, incomingMessage]);
      });

      socketRef.current.on(
        START_TYPING_MESSAGE_EVENT,
        (typingInfo: TypingInfo) => {
          if (typingInfo.senderId !== user.password) {
            const user = typingInfo.user;
            setTypingUsers((users) => [...users, user]);
          }
        }
      );

      socketRef.current.on(
        STOP_TYPING_MESSAGE_EVENT,
        (typingInfo: TypingInfo) => {
          if (typingInfo.senderId !== user.password) {
            const user = typingInfo.user;
            setTypingUsers((users) =>
              users.filter((u) => u.name !== user.name)
            );
          }
        }
      );

      return () => {
        socketRef.current.disconnect();
      };
    });
  }, [roomId, user]);

  const sendMessage = (messageBody: string) => {
    if (!user) return;
    socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {
      body: messageBody,
      senderId: user.password,
      user: user,
    });
  };

  const startTypingMessage = () => {
    if (!user) return;
    socketRef.current.emit(START_TYPING_MESSAGE_EVENT, {
      senderId: user.password,
      user,
    });
  };

  const stopTypingMessage = () => {
    if (!user) return;
    socketRef.current.emit(STOP_TYPING_MESSAGE_EVENT, {
      senderId: user.password,
      user,
    });
  };

  return {
    messages,
    user,
    users,
    typingUsers,
    sendMessage,
    startTypingMessage,
    stopTypingMessage,
    setUser,
  };
}
