import '../styles/signIn.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
type SignIN_User = {
    username: string,
    password: string
}
export function SingInUser() {

    const [SignIn, SetSignIn] = useState<SignIN_User>({
        username: "",
        password: ""
    });

    const handleSignIn = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        SetSignIn({ ...SignIn, [name]: value });
    };

    const handleVerifyUser = async () => {

        if (SignIn.username.trim() === "" || SignIn.password.trim() === "") {
            return;
        }
        try {
            
            // Auth API runs on 3001 (App-Backend owns 3000)
            const response = await fetch("http://localhost:3001/sign-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(SignIn)
            });

            const data = await response.json();

            // Only redirect on success — 401 (wrong user/password) must not proceed.
            if (!response.ok) {
                alert(data?.message || "Sign-in failed");
                return;
            }

            // Keep the JWT on THIS origin (useful if we navigate back).
            if (data?.token) {
                sessionStorage.setItem("token", data.token);
            }

            // CROSS-ORIGIN HANDOFF — this is why a plain redirect never worked.
            // localhost:5173 and localhost:5174 are DIFFERENT origins (storage is
            // keyed by scheme+host+port), so sessionStorage written here is
            // invisible to /App. The token has to ride in the URL; /App stores it
            // on its own origin and strips it from the address bar right away.
            window.location.replace(
                data?.token
                    ? `http://localhost:5174/App?token=${encodeURIComponent(data.token)}`
                    : "http://localhost:5174/App"
            );

        }
        catch (err) {
            console.error(`oops.. something went wrong ${err}`);
            alert(`Could not reach the auth server: ${err}`);
        }
    }

    return (
        <>
            <div className="SignIn-body">
                <h1 className='signIn-title'> Sign-IN </h1>
                <div className="signIn-input">
                    <p className='msg'>Thanks to Re-visit this project</p>
                    <div className="inner-Div">

                        <h3 className="username-signIn">Username: </h3>
                        <input
                            type="text"
                            name="username"
                            className="username-signin"
                            placeholder="Enter your username.."
                            value={SignIn.username}
                            onChange={handleSignIn}
                        />

                        <h3 className="pass-signIn">Password: </h3>
                        <input
                            type="password"
                            name="password"
                            className="pass-signin"
                            placeholder="Enter your password.."
                            value={SignIn.password}
                            onChange={handleSignIn}
                        />

                        <Link to="/login">New User? Login</Link>

                        <button onClick={handleVerifyUser} className='btn-signIn'>Verify</button>
                    </div>
                </div>
            </div>
        </>
    )
}