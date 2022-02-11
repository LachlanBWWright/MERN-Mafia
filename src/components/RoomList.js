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
                            
                            <ListGroup.Item key={index}>
                            Room Capacity: {room.size} | People In Room: {room.playerCount}
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
        console.log('Sample data:' + data[9].size)
        await this.setState({roomList: data})
        await this.setState({dataLoading: false})
        
    }

    setRoom(event) {
        console.log('Room set!')
    }
}

export default RoomList;