import React, { useEffect, useState, useRef } from 'react';
import ChatBar from './components/ChatBar';
import ChatBody from './components/ChatBody';
import ChatFooter from './components/ChatFooter';

import styles from "./styles/chat.module.css"

const ChatPage = ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState('');
  const lastMessageRef = useRef(null);


  useEffect(() => { // get message
    socket.on('messageResponse', (data) => setMessages([...messages, data]));
  }, [socket, messages]);

  useEffect(() => {
    // 👇️ scroll to bottom every time messages change
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    socket.on('typingResponse', (data) => setTypingStatus(data));
  }, [socket]);

  return (
    <div className={styles.chat}>
      <ChatBar socket = {socket}/>
      <div className={styles.chat_main}>
        <ChatBody
          messages={messages}
          typingStatus={typingStatus}
          lastMessageRef={lastMessageRef}
        />
        <ChatFooter socket = {socket}/>
      </div>
    </div>
  );
};

export default ChatPage;
