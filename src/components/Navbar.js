/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import Icon from '../images/icon.png';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const Navbar = ({ usuario, handleLogout }) => {
    const location = useLocation(); // Obtiene la ruta actual


    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light" >
                <div className="container">
                    <Link className="navbar-brand" to='/'>
                        <img src={Icon} className='icon' />
                    </Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="user-icon">
                            <FontAwesomeIcon icon={faUser} />
                        </span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNavDropdown">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {usuario.usuario || 'Usuario'}
                                </a>
                                <ul className="dropdown-menu mi-dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                                    {location.pathname !== "/MiPerfil" && (
                                        <li>
                                            <Link className="dropdown-item" to="/MiPerfil">
                                                <FontAwesomeIcon icon={faUser} className="mi-dropdown-item-icon" /> Ver perfil
                                            </Link>
                                        </li>
                                    )}
                                    <li>
                                        <button className="dropdown-item" onClick={handleLogout}>
                                            <i className="fas fa-sign-out-alt mi-dropdown-item-icon"></i> Cerrar sesión
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Navbar
