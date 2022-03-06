import React from 'react';
import {ListGroup, Row, Col, Button} from 'react-bootstrap';

class PlayerItem extends React.Component {
    constructor(props) {
        super(props)

        this.state = ({
            visitClicked: true,
            role: null
        });

        this.handleWhisperClick = this.handleWhisperClick.bind(this);
        this.handleVisitClick = this.handleVisitClick.bind(this);

    }

    render() {
        return (
            <ListGroup.Item variant={this.props.variant}>
                <Row>
                    <Col>
                        {this.props.username} {this.state.role != null?"(" + this.props.role + ")":""}
                    </Col>
                    <Col md="auto">
                        <Button disabled={!this.props.canWhisper} variant="primary">Whisper</Button>
                        <Button disabled={!this.props.canVisit}  variant={this.state.visitClicked?"success":"primary"} onClick={this.handleVisitClick}>Visit</Button>
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

    componentDidMount() {

    }

    componentWillUnmount() {

    }
}

export default PlayerItem;