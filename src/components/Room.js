import React from 'react';
import socket from '../socket'
import {Form, Container, Row, Col, Button} from 'react-bootstrap';

class Room extends React.Component {
    constructor(props) {
        super(props); //Needed to call React.Components constructor

        this.state = {
            textMessage: '',
            messages: []
        };

        //this.props.playerName, this.props.playerRoom

        this.changeText = this.changeText.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }

    render() {
        return (
            <>
                <div style={{height: '65vh', overflowY: 'scroll'}}>
                    {this.state.messages && this.state.messages.map(msg => <p>{msg}</p>)}  
                </div>
                <hr></hr>
                <Form onSubmit={e => e.preventDefault()}>
                    <Container fluid>
                        <Row className="justify-content-xl-center" xs="auto">
                            <Col md={8}>
                                <Form.Control value={this.state.textMessage} onChange={this.changeText} />
                            </Col>
                            <Col md={2}>
                                <Button variant='danger' onClick={this.sendMessage} className="btn-block">Submit</Button> 
                            </Col>
                        </Row>
                    </Container>
                </Form>
           </>
        )

    }

    changeText(event) {
        this.setState({textMessage: event.target.value})
        //console.log('Changed text: ' + this.state.textMessage)  
    }

    sendMessage() {
        this.setState({messages: [...this.state.messages, this.props.playerName + ': ' + this.state.textMessage]}); //Append to the messages array
        socket.emit('messageSentByUser', this.state.textMessage, this.props.playerName, this.props.playerRoom); //Sends to server
        console.log('Playername: ' + this.props.playerName + ' Player Room: ' + this.props.playerRoom)
        //playerName={this.state.playerName} playerRoom={this.state.playerRoom}
        this.setState({textMessage: ''})
    }

    componentDidMount() {
        socket.on('connect', () => {
            console.log('You connected to the socket with ID ' + socket.id);
          })
        
        socket.on('receive-message', (inMsg) => {
            console.log('Message recieved: ' + inMsg);
            this.setState({messages: [...this.state.messages, inMsg]});
        })

        console.log('Joining a room');
        socket.emit('playerJoinRoom', this.props.playerName, this.props.playerRoom);

    }
}

export default Room;
