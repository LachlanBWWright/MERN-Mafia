import React from 'react';
import {Navbar, Nav} from 'react-bootstrap';
import { Outlet, Link} from 'react-router-dom';
import axios from 'axios';


class MafSiteNavbar extends React.Component {
    state = {
        isLoggedIn: false,
        userID: '',
        name: '',
        email: '',
        picture: ''
    }

    handleTestClick() {
        console.log('Click test!');
        axios.get('/auth/facebook');
    }

    render() {
        return (
            <>            
                <Navbar className="navbar-dark" bg="danger" expand="lg" sticky="top">
                    <Nav>
                            <Navbar.Brand as={Link} to="/">MERN Mafia</Navbar.Brand>         
                    </Nav>                              

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/play">Play</Nav.Link>                  
                            <Nav.Link as={Link} to="/faq">FAQ</Nav.Link>
                            <Nav.Link as={Link} to="/settings">Settings</Nav.Link> 
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                
                <Outlet/>
            </>
        )
    }
}

export default MafSiteNavbar;