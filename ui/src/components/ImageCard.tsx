import React from 'react';
import { Card } from "react-bootstrap";

interface Props {
    url: string,
    onClick: () => void
}

const ImageCard: React.FunctionComponent<Props> = (props) => {
    return (
        <Card
            bg="secondary"
            onClick={props.onClick}
        >
            <Card.Img
                src={'/image/240x240/smart/' + props.url}
                variant="top"
            />
        </Card>
    );
}

export default ImageCard;
