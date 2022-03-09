import React from 'react';
import {ListGroup, Row, Col, Button} from 'react-bootstrap';

class PlayerItem extends React.Component {
    constructor(props) {
        super(props)

        this.state = ({
            visitClicked: true,
            variant: "",
            canWhisper: false,
            canVisit: false
        });

        this.handleWhisperClick = this.handleWhisperClick.bind(this);
        this.handleVisitClick = this.handleVisitClick.bind(this);

    }

    render() {
        return (
            <ListGroup.Item variant={this.state.variant}>
                <Row>
                    <Col>
                        {this.props.username} {this.props.role !== undefined?`(${this.props.role})`:""}
                    </Col>
                    <Col md="auto">
                        {this.state.canWhisper && <Button variant="primary">Whisper</Button>}
                        {this.state.canVisit && <Button variant={this.state.visitClicked?"success":"primary"} onClick={this.handleVisitClick}>Visit</Button>}
                    </Col>
                </Row>
            </ListGroup.Item>
        )
    }

    handleWhisperClick() {

    }

    handleVisitClick() {
        this.setState({visitClicked: !this.state.visitClicked});
    }

    componentDidUpdate(prevProps, prevState) {
        //Sets the ListGroupItem's colour to represent the player's state
        //if(!this.props.isAlive) this.setState({variant: "danger"});
        if(this.props.isAlive !== prevProps.isAlive) {
            if(this.props.isAlive)  {
                this.setState({variant: "primary", canVisit: true, canWhisper: true});
            }
            else  {
                this.setState({variant: "danger", canVisit: false, canWhisper: false});
            }
        }
    }

    componentWillUnmount() {

    }
}

export default PlayerItem;