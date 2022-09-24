import React from 'react';
import {Card} from 'react-bootstrap';

class FourOFour extends React.Component {
    render() {
        return (
            <Card style={{margin: '2vh', flex: 1}}>
                <Card.Body>
                    <Card.Title className='text-center'>404</Card.Title>
                    <Card.Text>
                        This is the 404 screen. Cool!     
                    </Card.Text>
                </Card.Body>
            </Card>   
        )
    }
}

export default FourOFour;