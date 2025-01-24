import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/home.module.css';

const Home = ({ socket }) => {
    const navigate = useNavigate();
    const [username, setUserName] = useState('');
    const [prefLang, setPrefLang] = useState('');
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch available languages
        fetch('http://localhost:4000/api/languages')
            .then(response => response.json())
            .then(data => {
                setLanguages(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching languages:', error);
                setLoading(false);
            });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username.trim() || !prefLang) {
            alert('Please enter a username and select a language');
            return;
        }

        localStorage.setItem('userName', username);
        localStorage.setItem('preferredLanguage', prefLang);

        // Send user info to server
        socket.emit('newUser', {
            username: username,
            socketID: socket.id,
            preferredLang: prefLang
        });

        navigate('/chat');
    };

    if (loading) {
        return <div className={styles.home_container}>Loading languages...</div>;
    }

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
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                required
            />

            <label htmlFor="language">Preferred Language</label>
            <select
                id="language"
                className={styles.lang_dropdown}
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value)}
                required
            >
                <option value="">Select a language</option>
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.name}>
                        {lang.name} ({lang.nativeName})
                    </option>
                ))}
            </select>

            <button type="submit" className={styles.home_cta}>
                SIGN IN
            </button>
        </form>
    );
};

export default Home;