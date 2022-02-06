import React from 'react';
import {Card} from 'react-bootstrap';

class PlayPage extends React.Component {    
    render() {
        return (
            <div style={{padding: '2vh'}}>
                <Card style={{width: '30rem', margin: 'auto'}}>
                    <Card.Body>
                        <Card.Title>Play</Card.Title>
                        <Card.Text>
                            You should be able to play the game from here!
                        </Card.Text>  
                    </Card.Body>
                </Card>   
            </div>
        )
    }
}

export default PlayPage;