import React from 'react';
import {Card} from 'react-bootstrap';
import roles from '../info/roles';

function RolesPage() { 
    const roleList= [...roles.entries()].map(item => (
        <>         
            <Card.Text style={{fontWeight: "bold"}}>{item[0]}</Card.Text>
            <Card.Text>{item[1]}</Card.Text>
        </>
    ));

    return (     
        <Card style={{margin: '2vh', flex: 1, overflow: 'auto'}}>
            <Card.Body>
                <Card.Title className='text-center'>Roles</Card.Title>
                {roleList}
            </Card.Body>
        </Card>   
    )
}

export default RolesPage;