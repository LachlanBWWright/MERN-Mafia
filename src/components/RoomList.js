import React from 'react';
import {ListGroup} from 'react-bootstrap';

class RoomList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            roomList: []
        }

        this.setRoom = this.setRoom.bind(this);
    }
    
    render() {
        return (
            <ListGroup>
                {/*      {this.state.messages && this.state.messages.map(msg => <p>{msg}</p>)} */}

                {this.state.roomList && this.state.roomList.map(room => <ListGroup.Item>{{/* Placeholder */}}</ListGroup.Item>)}

                <ListGroup.Item onClick={this.setRoom} action >
                    Link 1
                </ListGroup.Item>
                <ListGroup.Item onClick={this.setRoom} action>
                    Link 2
                </ListGroup.Item>

            </ListGroup>
        )
    }

    //Get the list of open rooms from the server
    componentDidMount() {
        console.log('Mounted!');
        //fetch('/backend_test')

        fetch('/getRooms')
            .then(res => res.json())
            .then(res => console.log('Test: ' + JSON.stringify(res)))
            
    }

    setRoom(event) {
        console.log('Room set!')
    }
}

export default RoomList;