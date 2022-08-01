import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'

const Header = () => {
    let { user, logoutUser } = useContext(AuthContext)
    return (
        <a>            
            {
                user ? (
                    <h5 onClick={logoutUser}>Logout</h5>
                ) : (
                    <h5>
                        <Link to="/login" > Login </Link>
                    </h5>
                )
            }

        </a>
    )
}

export default Header