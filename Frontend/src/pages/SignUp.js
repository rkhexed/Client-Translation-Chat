import React, { useState } from 'react';


const SignUp = ({socket})=>{
    const navigate = useNavigate();
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!username.trim() || !password.trim()) {
            alert('Please enter a username and select a language');
            return;
        }
        //call backend api to ensure login, based on response, either 

        if(true){
            // create account
            navigate('/');
        }
        else {
            alert("retry");
            
        }

    }


    return(
        <form classname={styles.SignUp_container} onSubmit={handleSubmit}>
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

            <label htmlFor="password">Username</label>
            <input
                type="text"
                minLength={8}
                name="password"
                id="password"
                className={styles.username_input}
                value={username}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
        
        
        </form>
        
    );
};


export default SignUp;