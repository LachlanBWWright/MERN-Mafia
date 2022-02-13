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
                            Room Name: {room.name} | Room Capacity: {room.size} | People In Room: {room.playerCount}
                            </ListGroup.Item>
                        )
                    })}
            </ListGroup>
        )
    }

    //Get the list of open rooms from the server
    async componentDidMount() {
        let response = await fetch('/getRooms');
        let data = await response.json();
        console.log('Number of rooms found: ' + data.length);
        await this.setState({roomList: data})
        await this.setState({dataLoading: false})
        
    }

    setRoom(roomName) {
        console.log('Room set with name ' + roomName);
        this.props.setRoom(roomName)
    }
}

export default RoomList;