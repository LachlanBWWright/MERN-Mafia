import React from 'react';
import {Card} from 'react-bootstrap';
import io from 'socket.io-client'; 

class Stats extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            stats: undefined
        }

        this.socket = io('/');
    }

    render() {
        return (
            <div style={{padding: '2vh'}}>
                <Card style={{margin: 'auto'}}>
                    <Card.Body>
                        <Card.Title className='text-center'>Statistics</Card.Title>
                            {
                                this.state.stats !== undefined ?
                                <Card.Text>Stats go here! </Card.Text>  
                                :
                                <Card.Text>Loading...</Card.Text>                              
                            }
                    </Card.Body>
                </Card>   
            </div>
        )
    }

    componentDidMount() {
        this.socket.on('connect', () => {
        })
    }

    componentWillUnmount() {
        this.socket.disconnect();
    }
}

export default Stats;