import React from 'react';
import { Card } from "react-bootstrap";

interface Props {
    folderName: string,
    onClick: () => void,
    className?: string
}

const FolderCard: React.FunctionComponent<Props> = (props) => {
    return (
        <Card onClick={props.onClick} className={props.className}>
            <Card.Body>
                <Card.Text>{props.folderName}</Card.Text>
            </Card.Body>
        </Card>
    );
}

export default FolderCard;