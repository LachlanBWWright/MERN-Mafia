import React from 'react';
import {Navbar, Nav} from 'react-bootstrap';
import {Outlet, Link} from 'react-router-dom';

class MafSiteNavbar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoggedIn: false,
            userID: '',
            name: '',
            email: '',
            picture: '',
            inGame: false
        }

        this.setInGame = this.setInGame.bind(this);
    }

    setInGame(inGame) {
        this.setState({
            inGame: inGame
        })
    }

    render() {
        return (
            <div style={{width: '100%', height: '100vh', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>           
                <Navbar className="navbar-dark" bg="danger" expand="lg" sticky="top">
                    <Nav>
                        <Navbar.Brand as={Link} to="/" disabled={this.state.inGame}>MERN Mafia</Navbar.Brand>         
                    </Nav>                              

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/" disabled={this.state.inGame}>Play</Nav.Link>                  
                            <Nav.Link as={Link} to="/faq" disabled={this.state.inGame}>FAQ</Nav.Link>
                            <Nav.Link as={Link} to="/roles" disabled={this.state.inGame}>Roles</Nav.Link>
                            <Nav.Link  as={Link} to="/stats" disabled={this.state.inGame}>Stats</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                    {!this.state.isLoggedIn && 
                    (<Nav>
                        <Nav.Link as={Link} to="/settings" disabled={this.state.inGame}>Settings</Nav.Link> 
                        <Nav.Link as={Link} to="/settings" className="justify-content-end" disabled={this.state.inGame}>Login Placeholder</Nav.Link>
                    </Nav>)
                    }
                </Navbar>
                <div style={{flex: 1, display: 'flex', flexDirection: 'column',  overflow: 'hidden'}}>
                    <Outlet context={this.setInGame} />
                </div>
            </div>
        )
    }
}

export default MafSiteNavbar;