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
    }

    changeText(event) {
        this.setState({playerNameBox: event.target.value}) //TODO: This immediately exits.
    }
    
    setName() {
        this.setState({playerName: this.state.playerNameBox});
        this.setState({playerNameBox: ''});
    }
    render() {
        //TODO: Conditional rendering for name and room showcases
        return (
            <div style={{padding: '2vh', width: '30 rem'}}>
                <Card style={{width: '30 rem', margin: 'auto'}}>
                    <Card.Body>
                        <Card.Title className='text-center'>Play</Card.Title>
                        {this.state.playerName ?
                            <>
                                <Card.Text>Your Name is: {this.state.playerName}</Card.Text>
                                
                            </>
                        :
                                
                            <Form>
                                <Card.Text>Enter Your Name</Card.Text>
                                <Form.Control value={this.state.playerNameBox} onChange={this.changeText} />
                                <Button variant='danger' onClick={this.setName} className="btn-block">Set Name</Button>
                            </Form>
                        }
                        
                        {/* TODO: Show the room name and Room component, or the RoomList Component */}
                        {this.state.playerRoom && this.state.playerName ?
                            <Card.Text>You are in room: </Card.Text>
                        :
                            <RoomList/>
                        }
                        
                        <hr></hr>
                        <Room/>
                    </Card.Body>
                    
                </Card>   
                
                <Outlet/> 
            </div>
        )
    }
}

export default PlayPage;