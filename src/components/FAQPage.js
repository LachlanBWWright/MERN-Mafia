import React from 'react';
import {Card} from 'react-bootstrap';

class FAQPage extends React.Component {    
    render() {
        return (
            <div style={{padding: '2vh'}}>
                <Card style={{width: '30rem', margin: 'auto'}}>
                    <Card.Body>
                        <Card.Title>Frequently Asked Questions</Card.Title>
                        <Card.Text>
                            Nobody's asked me any questions.
                        </Card.Text>  
                    </Card.Body>
                </Card>   
            </div>
        )
    }
}

export default FAQPage;