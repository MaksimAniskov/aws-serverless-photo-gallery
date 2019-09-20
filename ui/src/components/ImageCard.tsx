import React from 'react';
import { Card } from "react-bootstrap";
import * as utils from "../utils";

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
                src={'/image/' + utils.base64encode(JSON.stringify({
                    key: props.url,
                    edits: { resize: { width: 240, height: 240 } }
                }))}
                variant="top"
            />
        </Card>
    );
}

export default ImageCard;
