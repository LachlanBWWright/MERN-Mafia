import React from 'react';
import {ListGroup} from 'react-bootstrap';

class RoomList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dataLoading: true,
            roomList: []
        }

        this.setRoom = this.setRoom.bind(this);

        this.abortController = new AbortController();
    }
    
    render() {
        return (
            <ListGroup>
                { this.state.dataLoading ? 
                    <p>Loading</p> 
                : 
                    this.state.roomList.map((room, index) => {
                        return(
                            room.playerCount !== room.size //Stop full rooms from appearing
                            &&
                            <ListGroup.Item key={index} action onClick={() => this.setRoom(room.name)}>
                            Room Name: {room.name} | Room Type: {room.roomType} | Room Capacity: {room.size} | People In Room: {room.playerCount}
                            </ListGroup.Item>
                        )
                    })}
            </ListGroup>
        )
    }

    //Get the list of open rooms from the server
    async componentDidMount() {
       
        let response = await fetch('/getRooms', { signal: this.abortController.signal });
        let data = await response.json();
        console.log('Number of rooms found: ' + data.length);

        //TODO: Try checking if state is mounted.
        console.log('Mounted Test 1')
        this.setState({roomList: data});
        console.log('Mounted Test 2')
        this.setState({dataLoading: false});
        console.log('Mounted Test 3 ')
        
    }

    componentWillUnmount() {
        this.abortController.abort();
    }

    setRoom(roomName) {
        console.log('Room set with name ' + roomName);
        this.props.setRoom(roomName)
    }
}

export default RoomList;