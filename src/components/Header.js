import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'

const Header = () => {
    let { user, logoutUser } = useContext(AuthContext)
    return (
        <a>            
            {
                user ? (
                    <span onClick={logoutUser}>Logout</span>
                ) : (
                    <Link to="/login" > Login </Link>
                )
            }

        </a>
    )
}

export default Header