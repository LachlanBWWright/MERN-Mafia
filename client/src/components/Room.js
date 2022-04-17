import React from 'react';
import io from 'socket.io-client'/* '../socket' */
import {Form, Container, Row, Col, Button, ListGroup} from 'react-bootstrap';
import PlayerItem from './PlayerItem.js'

class Room extends React.Component {
    constructor(props) {
        super(props); //Needed to call React.Components constructor

        this.state = {
            textMessage: '',
            canTalk: true,
            time: 'Day',
            dayNumber: 0,
            timeLeft: 0,
            messages: [],
            playerList: [],
            visiting: null,
            votingFor: null
        };

        this.changeText = this.changeText.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        

        this.handleVisit = this.handleVisit.bind(this);
        this.handleVote = this.handleVote.bind(this);
        this.handleWhisper = this.handleWhisper.bind(this);

        this.scrollRef = React.createRef(); //React reference

        this.socket = io('/');
    }

    render() {
        return (
            <>
                <Container fluid>
                    <Row>
                        <Col md="auto" style={{height: '70vh', overflow: 'auto'}}>
                            {this.state.dayNumber !== 0?<p>{this.state.time} number {this.state.dayNumber}. Seconds remaining: {this.state.timeLeft}</p>:<p>Players in room: {this.state.playerList.length}</p>}
                            <ListGroup>
                                {this.state.playerList && this.state.playerList.map(player => 
                                <PlayerItem key={player.name} handleVisit={this.handleVisit} handleVote={this.handleVote} handleWhisper={this.handleWhisper} 
                                dayVisitLiving={this.state.dayVisitLiving} dayVisitDead={this.state.dayVisitDead} nightVisitLiving={this.state.nightVisitLiving} nightVisitDead={this.state.nightVisitDead}  
                                visiting={this.state.visiting} votingFor={this.state.votingFor} isUser={player.isUser} username={player.name} role={player.role} isAlive={player.isAlive} time={this.state.time} canTalk={this.state.canTalk}/> )}
                            </ListGroup>
                        </Col>
                        <Col>
                            <div style={{height: '70vh', overflowY: 'scroll'}} ref={this.scrollRef}>
                                {this.state.messages && this.state.messages.map((msg, index) => <p key={index}>{msg}</p>)}
                            </div>
                        </Col>
                    </Row>
                </Container>

                <hr></hr>

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

    handleVisit(playerUsername) {
        
        if(this.state.visiting !== playerUsername) {
            this.setState({visiting: playerUsername});
            this.socket.emit('messageSentByUser', '/c ' + playerUsername);
        }
        else {
            this.setState({visiting: null});
            this.socket.emit('messageSentByUser', '/c');
        }
    }

    handleWhisper(playerUsername) {
        this.setState({textMessage: '/w ' + playerUsername + ' '});
    }

    handleVote(playerUsername) {
        if(this.state.votingFor !== playerUsername) {
            this.setState({votingFor: playerUsername});
            this.socket.emit('messageSentByUser', '/v ' + playerUsername);
        }
        else {
            this.setState({votingFor: null});
            this.socket.emit('messageSentByUser', '/v ');
        }
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
                this.setState({messages: [...this.state.messages, inMsg]}); //Adds message to message list.
                this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
            }
            else this.setState({messages: [...this.state.messages, inMsg]}); //Adds message to message list.
        })

        this.socket.on('receive-player-list', (listJson) => { //Receive all players upon joining, and the game starting
            this.setState({playerList: listJson});
        });

        this.socket.on('receive-new-player', (playerJson) => { //Called when a new player joins the lobby
            this.setState({ playerList: [...this.state.playerList, playerJson]})
        })

        this.socket.on('remove-player', (playerJson) => { //Called when a player leaves the lobby before the game starts
            console.log('Removing player ' + playerJson.name);
            this.setState({ playerList: this.state.playerList.filter(player => player.name !== playerJson.name)});
        })

        this.socket.on('assign-player-role', (playerJson) => { //Shows the player their own role, lets the client know that this is who they are playing as 
            let tempPlayerList = [...this.state.playerList];
            let index = tempPlayerList.findIndex(player => player.name === playerJson.name);
            tempPlayerList[index].role = playerJson.role;
            tempPlayerList[index].isUser = true;
            //TODO: Who player visits at day (living) (0 - Nobody, 1 - Self, 2 - Others, 3 - Everybody)
            //TODO: Who player visits at day (dead, will apply to almost (or currently) no roles) 
            //TODO: Who player visits at night (living)
            //TODO: Who player visits at night (dead)
            this.props.setRole(playerJson.role);
            this.setState({playerList: tempPlayerList});
        })

        this.socket.on('update-player-role', (playerJson) => { //Updates player role upon their death
            let tempPlayerList = [...this.state.playerList];
            let index = tempPlayerList.findIndex(player => player.name === playerJson.name);
            if(playerJson.role !== undefined) tempPlayerList[index].role = playerJson.role;
            tempPlayerList[index].isAlive = false;
            this.setState({playerList: tempPlayerList});
        })

        this.socket.on('update-player-visit', (playerJson) => { //Updates player to indicate that the player is visiting them
            //JSON contains player name
            //Get player by name, update properties, update JSON

        })

        this.socket.on('update-day-time', (infoJson) => { //Gets whether it is day or night, and how long there is left in the session
            this.setState({time: infoJson.time});
            this.setState({dayNumber: infoJson.dayNumber});
            this.setState({visiting: null}); //Resets who the player is visiting
            this.setState({votingFor: null});
            let timeLeft = infoJson.timeLeft;
            let countDown = setInterval(() => {
                if(timeLeft > 0) {
                    this.setState({timeLeft: timeLeft - 1});
                    timeLeft--;
                }
                else {
                    clearInterval(countDown);
                }
            }, 1000)
        })


        this.socket.on('block-messages', () => {
            this.setState({canTalk: false});
        })

        this.socket.emit('playerJoinRoom', this.props.playerName, this.props.playerRoom, callback => {
            if(callback !== 0) {
                if(callback === 1) this.props.setFailReason('Your socket ID was equal to existing player in room.');
                else if(callback === 2) this.props.setFailReason('Your selected username was the same as another player in the room.');
                else if(callback === 3) this.props.setFailReason('The room was full.');
                this.props.setRoom('');
                this.props.setName('');
                this.props.setRole('not yet assigned');
            }
            else this.props.setFailReason('');
        });

    }

    componentWillUnmount() {
        this.socket.off('receive-message');
        this.socket.off('block-messages');
        this.socket.off('receive-role');
        this.socket.off('receive-player-list');
        this.socket.off('receive-new-player');
        this.socket.off('remove-player');
        this.socket.off('update-player-role');
        this.socket.off('update-player-visit');
        this.socket.disconnect();
    }


}

export default Room;
