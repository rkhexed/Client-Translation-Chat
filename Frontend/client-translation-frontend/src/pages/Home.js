import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/home.module.css'

const Home = ({socket}) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [prefLang, setPrefLang] = useState('');
  const [languages, setLanguages] = useState(["Choose your language","English", "or", "Spanish"]);
  

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('userName', userName);

    //sends the username and socket ID to the Node.js server
    socket.emit('newUser', { userName, socketID: socket.id, preferredLang: prefLang });

    navigate('/chat');
  };
  return (
    <form className={styles.home_container} onSubmit={handleSubmit}>
      <h2 className={styles.home_header}>Sign in to Open Chat</h2>
      <label htmlFor="username">Username</label>
      <input
        type="text"
        minLength={2}
        name="username"
        id="username"
        className={styles.username_input}
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <div className={styles.home_bottom}>
        <select className={styles.lang_dropdown}>

          {languages.map((language, index) => 
            <option key = {index} value = {language}>{language}</option>
          )}
          
        </select>
        <button className={styles.home_cta}>SIGN IN</button>
      </div>
      
    </form>
  );
};

export default Home;