import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/chat.module.css'

const ChatBody = ({ messages, typingStatus, lastMessageRef }) => {
  const navigate = useNavigate();

  const handleLeaveChat = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('preferredLanguage');
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      <header className={styles.chat_mainHeader}>
        <p>Hangout with Colleagues</p>
        <button className={styles.leaveChat_btn} onClick={handleLeaveChat}>
          LEAVE CHAT
        </button>
      </header>

      {/*This shows messages sent from you*/}
      <div className={styles.message_container}>
        {messages.map((message) =>

          message.name === localStorage.getItem('userName') ? (

        <div className={styles.message_chats} key={message.id}>
          <p className={styles.sender_name}>You</p>
          <div className={styles.message_sender}>
            <p>{message.text}</p>
          </div>
        </div>

            ) : (  // otherwise

        /*This shows messages received by you*/
        <div className={styles.message_chats} key={message.id}>
          <p>{message.name}</p>
          <div className={styles.message_recipient}>
            <p>{message.text}</p>
          </div>
        </div>

            )
        )};
        

        {/*This is triggered when a user is typing*/}
        <div className={styles.message_status}>
          <p>{typingStatus}</p>
        </div>
        <div ref={lastMessageRef} />
      </div>
    </>
  );
};

export default ChatBody;