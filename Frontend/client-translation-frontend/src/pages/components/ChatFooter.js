import React, { useState } from 'react';
import styles from '../styles/chat.module.css'

const ChatFooter = ({ socket }) => {
  const [message, setMessage] = useState('');

  const handleTyping = () =>
    socket.emit('typing', `${localStorage.getItem('userName')} is typing`);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && localStorage.getItem('userName')) {
      // socket req
      socket.emit('message', {
        text: message,
        name: localStorage.getItem('userName'),
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
      });
      // THIS IS FOR API TESTING
      console.log('meow')
      fetch('http://localhost:4000/api')
        .then((res) => res.json())
        .then(({message}) => console.log(message))
    }
    setMessage('a');
  };



  return (
    <div className={styles.chat_footer}>
      <form className="form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Write message"
          className={styles.message}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTyping}
        />
        <button className={styles.sendBtn}>SEND</button>
      </form>
    </div>
  );
};

export default ChatFooter;
