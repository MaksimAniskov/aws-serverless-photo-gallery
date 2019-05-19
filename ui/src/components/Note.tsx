import React from 'react';

interface Props {
    caption: string
}

const Note: React.FunctionComponent<Props> = (props) => {
    return (
        <div className="note">
            {props.caption}
        </div>
    );
}

export default Note;
