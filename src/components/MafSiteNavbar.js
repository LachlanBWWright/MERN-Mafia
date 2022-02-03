import React from 'react';
import {Navbar, Nav} from 'react-bootstrap';
import { Outlet, Link } from 'react-router-dom';


class MafSiteNavbar extends React.Component {
    state = {
        isLoggedIn: false,
        userID: '',
        name: '',
        email: '',
        picture: ''
    }


    render() {
        return (
            <>            
                <Navbar className="navbar-dark" bg="danger" expand="lg" sticky="top">                              
                    <Link to="/">
                        <Navbar.Brand href="#home">MERN Mafia</Navbar.Brand>        
                    </Link>  
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Link to="/play">
                                <Nav.Link href="/link">Play</Nav.Link>
                            </Link>
                            <Link to="/faq">
                                <Nav.Link href="/link">FAQ</Nav.Link>
                            </Link>
                            <Link to="/settings">
                                <Nav.Link href="/link">Settings</Nav.Link>
                            </Link>      
                        </Nav>
                    </Navbar.Collapse>
                    <Nav>
                        {


                        }
                        <Link to="/facebook">
                            <Nav.Link href="/link">Sign In With Facebook</Nav.Link>
                        </Link>
                    </Nav>   
            </Navbar>
            <Outlet/>
            </>
        )
    }
}

export default MafSiteNavbar;