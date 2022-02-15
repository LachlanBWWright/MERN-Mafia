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
            playerRoom: ''

        }

        //this.functionName = this.functionName.bind(this)
        this.changeText = this.changeText.bind(this);
        this.setName = this.setName.bind(this);
        this.handleRoomChange = this.handleRoomChange.bind(this);
    }

    //TODO: Call server, check if the player is already in an existing room, and render it

    changeText(event) { //Updates so that whatever is in the textbox is accurately recorded
        this.setState({playerNameBox: event.target.value})      
    }

    handleRoomChange(room) {
        console.log('Room Set!')
        this.setState({playerRoom: room})
    }
    
    setName() { //Changes the state to reflect the selected name
        this.setState({playerName: this.state.playerNameBox});
        this.setState({playerNameBox: ''});
    }
    render() {
        if(this.state.playerName && this.state.playerRoom !== '') { /* Shows the room if a name and room has been selected */
            return (
                <div style={{padding: '2vh', width: '30 rem'}}>
                    <Card>
                        <Card.Body>
                            <Card.Text>Your Name is {this.state.playerName}. You are in room {this.state.playerRoom}.</Card.Text>
                            <Room playerName={this.state.playerName} playerRoom={this.state.playerRoom} setRoom={this.handleRoomChange}/> {/*TODO - Pass necessary params down to the room*/} 
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
                                    <RoomList setRoom={this.handleRoomChange}/>
                                </>
                            :        
                                <Form onSubmit={e => e.preventDefault()}> {/* Stops the page from refreshing if user hits enter while typing*/}
                                    <Card.Text>Enter Your Name</Card.Text>
                                    <Form.Control value={this.state.playerNameBox} onChange={this.changeText} />
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