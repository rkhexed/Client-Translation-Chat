import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/home.module.css';

const Home = ({ socket }) => {
    const navigate = useNavigate();
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !prefLang) {
            alert('Please fill out all fields!');
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ username: username.trim(), password:password.trim()})
            });

            const data = await response.json();
        
            if (response.ok) {
                // login
                localStorage.setItem('userName', data.token);
                localStorage.setItem('preferredLanguage', prefLang);

                // Send user info to server
                socket.emit('newUser', {
                    username: username,
                    socketID: socket.id,
                    preferredLang: prefLang
                });

                navigate('/chat');

            } else {
                alert(data.error)
            }

        }catch (e){
            console.error(e);
        }

        
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

            <label htmlFor="password">Password</label>
            <input
                type="password"
                minLength={5}
                name="password"
                id="password"
                className={styles.username_input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <a href="/SignUp">Sign up</a>
        </form>
    );
};

export default Home;