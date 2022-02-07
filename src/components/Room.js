import React from 'react';
import socket from '../socket'
import {Form, Container, Row, Col, Button} from 'react-bootstrap';

class Room extends React.Component {
    constructor(props) {
        super(props); //Needed to call React.Components constructor

        this.state = {
            textMessage: ''
        };

        this.changeText = this.changeText.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }

    render() {
        return (
            <>
                <div style={{height: '75vh', overflowY: 'scroll'}}>
                    {/* Insert messages here */}
                    <p>Chat log goes here!</p>
                    <p>Chat log goes here!</p>
                </div>
                <hr></hr>
                <Form>
                    <Container fluid>
                        <Row className="justify-content-xl-center" xs="auto">
                            <Col md={8}>
                                <Form.Control onChange={this.changeText}/>
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
        console.log('Input: ' + this.state.textMessage)
        console.log('Message sent.');
        socket.emit('messageSentByUser', this.state.textMessage);
    }

    componentDidMount() {
        socket.on('connect', () => {
            console.log('You connected to the socket with ID ' + socket.id);
          })
        
    }
}

export default Room;
