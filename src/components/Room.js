import React from 'react';
import io from 'socket.io-client'/* '../socket' */
import {Form, Container, Row, Col, Button} from 'react-bootstrap';

class Room extends React.Component {
    constructor(props) {
        super(props); //Needed to call React.Components constructor

        this.state = {
            textMessage: '',
            canTalk: true,
            messages: []
        };

        this.changeText = this.changeText.bind(this);
        this.sendMessage = this.sendMessage.bind(this);

        this.scrollRef = React.createRef(); //React reference

        this.socket = io('http://localhost:5000');
    }

    render() {
        return (
            <>
                <div style={{height: '65vh', overflowY: 'scroll'}} ref={this.scrollRef}>
                    {this.state.messages && this.state.messages.map(msg => <p>{msg}</p>)}
                    
                </div>
                <hr></hr>

                {/* Show text box or disconnect button */}
                <Form onSubmit={e => {e.preventDefault(); this.sendMessage()}}>
                    <Container fluid>
                        {this.state.canTalk ?
                            <Row className="justify-content-xl-center" xs="auto"> 
                                <Col md={8}>
                                    <Form.Control value={this.state.textMessage} onChange={this.changeText} maxLength={150} />
                                </Col>
                                <Col md={2}>
                                    <Button variant='danger' onClick={this.sendMessage} className="btn-block">Submit</Button> 
                                </Col>
                            </Row>
                        : 
                            <Row className="justify-content-xl-center" xs="auto">
                                <Col md={2}>
                                    <Button variant='danger' onClick={() => {this.props.setRoom(''); this.props.setName(''); }} className="btn-block">Disconnect</Button> 
                                </Col>
                            </Row>
                        }
                    </Container>
                </Form>
           </>
        )

    }

    changeText(event) {
        this.setState({textMessage: event.target.value})  
    }

    sendMessage() {
        if(this.state.textMessage.length > 0 && this.state.textMessage.length <= 150) {
            this.socket.emit('messageSentByUser', this.state.textMessage, this.props.playerName, this.props.playerRoom); //Sends to server
            this.setState({textMessage: ''}) //Clears the text box
        }

    }

    componentDidMount() {
        this.socket.on('connect', () => {
            console.log('You connected to the socket with ID ' + this.socket.id);
        })
        
        this.socket.on('receive-message', (inMsg) => {
            //Scrolls down if the user is close to the bottom, doesn't if they've scrolled up the review the chat history (By more than 1/5th of the window's height)
            if(this.scrollRef.current.scrollHeight - this.scrollRef.current.scrollTop - this.scrollRef.current.clientHeight <= this.scrollRef.current.clientHeight/5) {
                this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
            }
        })

        this.socket.on('receive-role', (roleMsg) => {
            this.props.setRole(roleMsg);
        })

        this.socket.on('block-messages', () => {
            this.setState({canTalk: false});
        })

        //TODO: Make callback take the user back to the room select page
        this.socket.emit('playerJoinRoom', this.props.playerName, this.props.playerRoom, callback => {
            console.log(callback)
            if(!callback) {
                //TODO: Tell the user why their attempt to join failed
                console.log('callback: ' + callback)
                this.props.setRoom('');
                this.props.setName('');
                this.props.setRole('not yet assigned');
            }
        });

    }

    componentWillUnmount() {
        this.socket.off('receive-message');
        this.socket.off('block-messages');
        this.socket.off('receive-role');
        this.socket.disconnect();
    }


}

export default Room;
