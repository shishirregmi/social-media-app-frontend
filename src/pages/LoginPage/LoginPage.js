import React, { useContext, useState } from 'react'
import AuthContext from '../../context/AuthContext'
import './LoginPage.css'

const LoginPage = () => {
  let { loginUser } = useContext(AuthContext)

  const [containerStyle, setContainerStyle] = useState('container')

  const toggleSignUp = () => {
    setContainerStyle('container right-panel-active')
  };

  const toggleSignIn = () => {
    setContainerStyle('container')
  };

  return (
    <div>
      <div class={containerStyle} id="container">
        <div class="form-container sign-up-container">
          <form>
            <h1>Register</h1>
            <span>or use your email for registration</span>
            <input type="text" name="first_name" placeholder="Enter First Name" />
            <input type="text" name="last_name" placeholder="Enter Last Name" />
            <input type="text" name="username" placeholder="Enter Username" />
            <input type="password" name="password" placeholder="Enter Password" />
            <input type="email" name="email" placeholder="Enter Email" />
            <button>Sign Up</button>
          </form>
        </div>
        <div class="form-container sign-in-container">
          <form onSubmit={loginUser}>
            <h1>Sign in</h1>
            <span>to use your account</span>
            <input type="text" name="username" placeholder="Enter Username" />
            <input type="password" name="password" placeholder="Enter Password" />
            <input type="submit" />
          </form>
        </div>
        <div class="overlay-container">
          <div class="overlay">
            <div class="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button class="ghost" onClick={toggleSignIn} id="signIn">Sign In</button>
            </div>
            <div class="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button class="ghost" onClick={toggleSignUp} id="signUp">Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}

export default LoginPage