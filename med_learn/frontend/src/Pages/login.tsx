import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../styles/login.css';

type LoginInfo = {
    username: string;
    email: string;
    password: string;
}

export function LoginPage() {
    const [inputLogin, setInputLogin] = useState<LoginInfo>({
        username: "",
        email: "",
        password: ""
    });

    const handleLoginInput = ( event: React.ChangeEvent<HTMLInputElement> ) => { 
        const { name, value } = event.target; 
        setInputLogin({ ...inputLogin, [name]: value }); 
    };

    const handleLoginSubmit = async() => {
        if(inputLogin.username.trim() === "" || inputLogin.email.trim() === "" || inputLogin.password.trim() === "") return;

        try{
            // Auth API runs on 3001 (App-Backend owns 3000)
            const response = await fetch('http://localhost:3001/login', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(inputLogin)
            });

            const ResData = await response.json();

            // Only redirect on success — otherwise 409 (duplicate user),
            // 400 (missing fields) and 401 would all "log you in" anyway.
            if (!response.ok) {
                alert(ResData?.message || "Sign-up failed");
                return;
            }

            // Keep the JWT on THIS origin (useful if we navigate back).
            if (ResData?.token) {
                sessionStorage.setItem("token", ResData.token);
            }

            // CROSS-ORIGIN HANDOFF — see signIn.tsx. :5173 and :5174 are
            // different origins, so /App cannot read what we stored here;
            // the token must travel in the URL instead.
            window.location.replace(
                ResData?.token
                    ? `http://localhost:5174/App?token=${encodeURIComponent(ResData.token)}`
                    : "http://localhost:5174/App"
            );
        }
        catch(err){
            console.error(`oops.. something went wrong ${err}`);
            alert(`Could not reach the auth server: ${err}`);
        }
    };

    return (
        <div className="login-body">
            <div className="title-OfLogin">
                <h1 className="heading">
                    Sign-Up
                </h1>
            </div>
            <div className="Input-OfLogin">
                <p className="msg-OfLogin">
                    Thanks for joining. Sign-Up below.
                </p>
                <h3 className="title-Username">
                    Username:
                </h3>
                <input
                    type="text"
                    name="username"
                    className="inp-username"
                    placeholder="Enter Username.."
                    value={inputLogin.username}
                    onChange={handleLoginInput}
                />
                <h3 className="title-email">
                    Email:
                </h3>
                <input
                    type="email"
                    name="email"
                    className="inp-email"
                    placeholder="Enter Email.."
                    value={inputLogin.email}
                    onChange={handleLoginInput}
                />
                <h3 className="title-pass">
                    Password:
                </h3>
                <input
                    type="password"
                    name="password"
                    className="inp-pass"
                    placeholder="Enter Password.."
                    value={inputLogin.password}
                    onChange={handleLoginInput}
                />

                {/* <a href="/sign-in">Already a user</a> */}
                <Link to="/sign-in">Already a user? Sign in</Link>

                <button onClick={handleLoginSubmit} className="btn-Submit">
                    Login
                </button>
            </div>
        </div>
    );
}
