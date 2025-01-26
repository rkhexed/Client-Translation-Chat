import React, { useState, useEffect } from 'react';
import styles from '../styles/chat.module.css'



const ChatBar = ({ socket }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on('newUserResponse', (data) => setUsers(data));
    
  }, [socket, users]);

  return (
    <div className={styles.chat_sidebar}>
      <h2>Open Chat</h2>
      <div>
        <h4 className={styles.chat_header}>ACTIVE USERS</h4>
        <div className={styles.chat_users}>
          {users.map((users) => (
            <p key={users.socketID}>{users.username}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatBar;
