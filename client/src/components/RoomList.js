import React from 'react';
import {ListGroup, Button} from 'react-bootstrap';
import {BsArrowRepeat} from "react-icons/bs";
import io from 'socket.io-client';

class RoomList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            roomList: undefined
        }

        this.socket = io('/');
        this.setRoom = this.setRoom.bind(this);
        this.getRooms = this.getRooms.bind(this);
        this.abortController = new AbortController();
    }
    
    render() {
        return (
            <>
            <ListGroup horizontal={true}>
            <Button variant="danger" onClick={this.getRooms}><BsArrowRepeat/> Refresh</Button>
                <br></br>
                { this.state.roomList ? 
                    this.state.roomList.map((room, index) => {
                        return(
                            room.playerCount !== room.size //Stop full rooms from appearing
                            &&
                            <ListGroup.Item key={index} action onClick={() => this.setRoom(room.name)}>
                            {room.size}-Player Game ({room.playerCount}/{room.size})
                            </ListGroup.Item>
                        )
                    })        
                : 
                    <p>Loading</p>
                }
            </ListGroup>
            </>
        )
    }

    //Get the list of open rooms from the server
    async componentDidMount() {
        this.getRooms();
        this.refreshInterval = setInterval(() => this.getRooms(), 10000);
    }

    componentWillUnmount() {
        this.socket.disconnect();
        clearInterval(this.refreshInterval)
    }

    setRoom(roomName) {
        console.log('Room set with name ' + roomName);
        this.props.setRoom(roomName)
    }

    getRooms() {
        this.socket.emit('getRoomList', cb => {
            this.setState({
                roomList: cb,
            })
        });
    }
}

export default RoomList;