import React from 'react';
import {Card} from 'react-bootstrap';

class FourOFour extends React.Component {
    render() {
        return (
            <div style={{padding: '2vh'}}>
                <Card style={{width: '30rem', margin: 'auto'}}>
                    <Card.Body>
                        <Card.Title className='text-center'>404</Card.Title>
                        <Card.Text>
                            This is the 404 screen. Cool!     
                        </Card.Text>
                    </Card.Body>
                </Card>   
            </div>
        )
    }
}

export default FourOFour;