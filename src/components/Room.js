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

        this.changeText = this.changeText.bind(this);
        this.sendMessage = this.sendMessage.bind(this);

        this.scrollRef = React.createRef(); //React reference
    }

    //TODO: Scrolling
    render() {
        return (
            <>
                <div style={{height: '65vh', overflowY: 'scroll'}} ref={this.scrollRef}>
                    {this.state.messages && this.state.messages.map(msg => <p>{msg}</p>)}
                    
                </div>
                <hr></hr>
                <Form onSubmit={e => {e.preventDefault(); this.sendMessage()}}>
                    <Container fluid>
                        <Row className="justify-content-xl-center" xs="auto">
                            <Col md={8}>
                                <Form.Control value={this.state.textMessage} onChange={this.changeText} maxLength={150} />
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
        if(this.state.textMessage.length > 0 && this.state.textMessage.length <= 150) {
            socket.emit('messageSentByUser', this.state.textMessage, this.props.playerName, this.props.playerRoom); //Sends to server
            this.setState({textMessage: ''}) //Clears the text box
        }

    }

    componentDidMount() {
        socket.on('connect', () => {
            console.log('You connected to the socket with ID ' + socket.id);
          })
        
        socket.on('receive-message', (inMsg) => {
            console.log('Message recieved: ' + inMsg + 'and ' + this.scrollRef.current.scrollHeight + ' ' + this.scrollRef.current.scrollTop + ' ' + this.scrollRef.current.clientHeight);
            //Scrollheight - Total height of the entire object
            //scrolltop - How far the user is scrolled down
            //Clientheight - The height of the div for the client
            //E.G if clientheight is 1000, the scrollheight is 1250, and the client has scrolled all the way down, scrolltop is 250
            this.setState({messages: [...this.state.messages, inMsg]});

            //Scroll the text window?
            
        })

        //TODO: Make callback take the user back to the room select page
        console.log('Joining a room');
        socket.emit('playerJoinRoom', this.props.playerName, this.props.playerRoom, callback => {
            console.log(callback)
            if(!callback) {
                console.log('callback: ' + callback)
                this.props.setRoom('');
            }
        });

    }
}

export default Room;
