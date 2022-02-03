import React from 'react';
import {Card} from 'react-bootstrap';

class IntroScreen extends React.Component {
    render() {
        return (
            <div style={{padding: '2vh'}}>
                <Card style={{width: '30rem', margin: 'auto'}}>
                    <Card.Body>
                        <Card.Title>Welcome to MERN Mafia!</Card.Title>
                        <Card.Text>
                            <p>This is a practice project, where I attempt to create a mafia-style game using a MERN Stack and SocketJS.</p>
                            <p>Created by Lachlan Wright</p>
                        </Card.Text>
                        
                    </Card.Body>
                </Card>   
            </div>
        )

    }
}

export default IntroScreen;