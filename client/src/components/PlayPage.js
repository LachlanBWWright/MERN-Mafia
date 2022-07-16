import React from 'react';
import {Card, Form, Button} from 'react-bootstrap';
import {Outlet} from 'react-router-dom';
import Room from './Room';
import RoomList from './RoomList';
import {GoogleReCaptcha} from 'react-google-recaptcha-v3'


class PlayPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            playerNameBox: '',
            playerName: '',
            playerRoom: '',
            playerRole: 'not yet assigned',
            failReason: '',
            captchaToken: ''
        }

        this.captchaToken = '';

        this.changeText = this.changeText.bind(this);
        this.setName = this.setName.bind(this);
        this.handleFailReason = this.handleFailReason.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleRoomChange = this.handleRoomChange.bind(this);
        this.handleRoleChange = this.handleRoleChange.bind(this);
    }

    changeText(event) {this.setState({playerNameBox: event.target.value})}
    handleFailReason(reason) {this.setState({failReason: reason});}
    handleRoomChange(room) {this.setState({playerRoom: room});}
    handleNameChange(name) {this.setState({playerName: name});}
    handleRoleChange(role) {this.setState({playerRole: role});}
    
    setName() { //Changes the state to reflect the selected name
        let name = this.state.playerNameBox;
        name = name.toLowerCase().replace(/[^a-zA-Z]+/g, ''); //Regex - Find all chars that arent a-z, A-Z, and replace with '' (nothing). 
        if(name.length >= 3 && name.length <= 12) { //Make sure that the name only contains characters, and is between 3-12 letters long
            this.setState({playerName: name});
            this.setState({playerNameBox: ''});
        }
    }

    render() {
        if(this.state.playerRoom !== '') { /* Shows the room if a name and room has been selected */
            return (
                <div style={{padding: '2vh', width: '30 rem'}}>
                    <Card>
                        <Card.Body>
                            <Card.Text>Your Name is {this.state.playerName}. Your role is {this.state.playerRole}.</Card.Text>
                            <Room captchaToken={this.captchaToken} playerName={this.state.playerName} playerRoom={this.state.playerRoom} setFailReason={this.handleFailReason} 
                                setName={this.handleNameChange} setRoom={this.handleRoomChange} setRole={this.handleRoleChange}
                            /> 
                        </Card.Body>
                    </Card>
                </div>  
            )
        }
        else {
            return (
                <div style={{padding: '2vh', width: '30 rem'}}>
                    <Card style={{width: '30 rem', margin: 'auto'}}>
                        <Card.Body>
                            <Card.Title className='text-center'>Play</Card.Title>
                                {this.state.playerName === '' || (<Card.Text>Your Name is: {this.state.playerName}</Card.Text>)}
                                <GoogleReCaptcha onVerify={token => this.captchaToken = token} />
                                <RoomList setRoom={this.handleRoomChange} setName={this.handleNameChange}/>                              
                        </Card.Body>  
                    </Card>   
                    <Outlet/> 
                </div>
            )
        }
    }
}

export default PlayPage;