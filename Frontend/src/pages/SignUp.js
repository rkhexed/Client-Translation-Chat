import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/signup.module.css';

const SignUp = ()=>{
    const navigate = useNavigate();
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    


    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!username.trim() || !password.trim()) {
            alert('Please enter a username and select a language');
            return;
        }
        // CHANGE TO PROPER ERROR HANDLE!!!!
        try{
            //console.log(username, password)
            const response = await fetch('http://localhost:4000/api/signup', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ username: username.trim(), password:password.trim() })
            });

            const data = await response.json();
        
            if (response.ok) {
                // create account
                //console.log("Success:", data.success);
                alert("Account created!");
                navigate('/');
            } else {
                alert(data.error)
            }


        } catch(e){
            console.error("req failed" + e)
        }


    }


    return(
        
        <form className={styles.SignUp_container} onSubmit={handleSubmit}>
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

            <button type="submit" className={styles.SignUp_cta}>
                SIGN UP
            </button>
        
        </form>
    );
};


export default SignUp;