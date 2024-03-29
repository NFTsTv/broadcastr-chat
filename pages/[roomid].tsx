import { useEffect, useState, useRef, FormEvent } from "react";
import { useRouter } from "next/router";
import useChat from "@/lib/usechat";
import ChatMessage from "@/components/chatmessage";
import useTyping from "@/lib/usetyping";
import NewMessageForm from "@/components/newmessageform";
import TypingMessage from "@/components/typingmessage";
import Users from "@/components/users";
import Layout from "@/components/layout";
import styles from "@/styles/chatroom.module.css";

export default function ChatRoom() {
  const router = useRouter();
  const { roomid, isCastr, address } = router.query;
  const isCastrBool = isCastr === "true";
  const {
    messages,
    user,
    users,
    typingUsers,
    sendMessage,
    startTypingMessage,
    stopTypingMessage,
    setUser,
  } = useChat(roomid as string);
  const [newMessage, setNewMessage] = useState("");
  const [timeDiff, setTimeDiff] = useState(0);
  const scrollTarget = useRef(null);
  const { isTyping, startTyping, stopTyping, cancelTyping } = useTyping();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const response = fetch("/api/currenttime")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setTimeDiff(Date.now() - data.current);
      })
      .catch((error) => {
        //---
      });
  }, []);

  const handleNewMessageChange = (event: FormEvent<HTMLInputElement>) => {
    setNewMessage(event.currentTarget.value.replace(/<\/?[^>]*>/g, ""));
  };

  const handleSendMessage = (event: FormEvent<HTMLInputElement>) => {
    event.preventDefault();
    cancelTyping();
    sendMessage(newMessage);
    setNewMessage("");
  };

  useEffect(() => {
    if (isTyping) startTypingMessage();
    else stopTypingMessage();
  }, [isTyping]);

  useEffect(() => {
    if (scrollTarget.current) {
      (scrollTarget.current as any).scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length + typingUsers.length]);

  useEffect(() => {
    if (address) {
      setUser({
        name: address.slice(0, 4) as string,
        password: address as string,
        picture: "https://avatars.dicebear.com/api/human/" + address + ".svg",
      });
    }
    if (isCastrBool) {
      setUser({
        name: "castr",
        password: "castr",
        picture: "https://avatars.dicebear.com/api/human/castr.svg",
      });
    }
  }, [address, isCastr]);

  return (
    <Layout>
      <div className={styles.chatRoomContainer}>
        <Users users={users}></Users>
        <div className={styles.messagesContainer}>
          <ol className={styles.messagesList}>
            {messages.map((message, i) => {
              message.sentAt += timeDiff;
              return (
                <li key={i}>
                  <ChatMessage message={message}></ChatMessage>
                </li>
              );
            })}
            {typingUsers.map((user, i) => (
              <li key={messages.length + i}>
                <TypingMessage user={user}></TypingMessage>
              </li>
            ))}
          </ol>
          <div ref={scrollTarget}></div>
        </div>
        {!isCastrBool ? (
          !user ? (
            <div className={styles.login}>
              <div className={styles.loginBox}>
                <label>Choose a Username</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                <label>Choose a Password</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  onClick={() =>
                    setUser({
                      name: userName,
                      password: password,
                      picture:
                        "https://avatars.dicebear.com/api/human/" +
                        userName +
                        ".svg",
                    })
                  }
                >
                  Chat!
                </button>
              </div>
            </div>
          ) : (
            <NewMessageForm
              newMessage={newMessage}
              handleNewMessageChange={handleNewMessageChange}
              handleStartTyping={startTyping}
              handleStopTyping={stopTyping}
              handleSendMessage={handleSendMessage}
            ></NewMessageForm>
          )
        ) : null}
      </div>
    </Layout>
  );
}
