import React from 'react';
import {Card, Form, Button} from 'react-bootstrap';
import {Outlet} from 'react-router-dom';
import Room from './Room';
import RoomList from './RoomList';


class PlayPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            playerNameBox: '',
            playerName: '',
            playerRoom: '',
            playerRole: 'not yet assigned',
            failReason: ''
        }

        //this.functionName = this.functionName.bind(this)
        this.changeText = this.changeText.bind(this);
        this.setName = this.setName.bind(this);
        this.handleFailReason = this.handleFailReason.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleRoomChange = this.handleRoomChange.bind(this);
        this.handleRoleChange = this.handleRoleChange.bind(this);
    }

    //TODO: Call server, check if the player is already in an existing room, and render it

    changeText(event) { //Updates so that whatever is in the textbox is accurately recorded
        this.setState({playerNameBox: event.target.value})      
    }

    handleFailReason(reason) {
        this.setState({failReason: reason});
    }

    handleRoomChange(room) {
        this.setState({playerRoom: room});
    }

    handleNameChange(name) {
        this.setState({playerName: name});

    }

    handleRoleChange(role) {
        this.setState({playerRole: role});
    }
    
    setName() { //Changes the state to reflect the selected name
        let name = this.state.playerNameBox;
        name = name.toLowerCase().replace(/[^a-zA-Z]+/g, ''); //Regex - Find all chars that arent a-z, A-Z, and replace with '' (nothing). 
        console.log('Test' + name)
        if(name.length >= 3 && name.length <= 12) { //Make sure that the name only contains characters, and is between 3-12 letters long
            this.setState({playerName: name});
            this.setState({playerNameBox: ''});
        }
    }
    render() {
        if(this.state.playerName && this.state.playerRoom !== '') { /* Shows the room if a name and room has been selected */
            return (
                <div style={{padding: '2vh', width: '30 rem'}}>
                    <Card>
                        <Card.Body>
                            <Card.Text>Your Name is {this.state.playerName}. You are in room {this.state.playerRoom}. Your role is {this.state.playerRole}.</Card.Text>
                            <Room playerName={this.state.playerName} playerRoom={this.state.playerRoom} setFailReason={this.handleFailReason} setName={this.handleNameChange} setRoom={this.handleRoomChange} setRole={this.handleRoleChange}/> {/*TODO - Pass necessary params down to the room*/} 
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
                            {this.state.playerName ?      /* Show name selection, then room selection */
                                <>
                                    <Card.Text>Your Name is: {this.state.playerName}</Card.Text>
                                    <RoomList setRoom={this.handleRoomChange} setName={this.handleNameChange}/>
                                </>
                            :        
                                <Form onSubmit={e => {e.preventDefault(); this.setName()}}> {/* Stops the page from refreshing if user hits enter while typing*/}
                                    {this.state.failReason !== '' && <Card.Text>You couldn't join the room. {this.state.failReason}</Card.Text>}
                                    <Card.Text>Enter Your Name: (3-12 lowercase letters only. Numbers, symbols, and spaces will be removed.)</Card.Text>
                                    <Form.Control value={this.state.playerNameBox} onChange={this.changeText} minLength={3} maxLength={12}/>
                                    <hr></hr>
                                    <Button variant='danger' onClick={this.setName} className="btn-block">Set Name</Button>
                                </Form>
                            }                  
                        </Card.Body>  
                    </Card>   
                    <Outlet/> 
                </div>
            )
        }
    }
}

export default PlayPage;