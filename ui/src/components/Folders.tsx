import React, { useEffect } from 'react';
import { CardDeck } from "react-bootstrap";
import InfiniteScroll from 'react-infinite-scroller';

import * as data from '../data';
import Note from './Note';
import FolderCard from './FolderCard';
import ImageCard from './ImageCard';

interface Props {
    path: string,
    onChangeFolderIntent?: (folderName: string) => void,
    onSwitchToViewingIntent: (index: number) => void
}

const Folders: React.FunctionComponent<Props> = (props) => {
    const context = data.useContext();
    useEffect(() => {
        data.useFetchSubfoldersAndSomeImages(context, props.path);
    });

    const [{ subfolders, isLoading, images, hasMoreImages }] = context;
    let subfoldersToDisplay = subfolders;
    if (props.path !== '/') {
        subfoldersToDisplay = ([FOLDER_LEVEL_UP]).concat(subfolders);
    }

    return (
        (isLoading && !hasMoreImages) ?
            <Note caption="Loading..." />
            :
            <InfiniteScroll
                className="folder-browser"
                initialLoad={false}
                loadMore={() => data.useFetchMoreImages(context)}
                hasMore={hasMoreImages}
                loader={<Note key={0} caption="Loading..." />}
            >
                <CardDeck className="folders">
                    {subfoldersToDisplay.map(subfolder => (
                        <FolderCard
                            className={subfolder === FOLDER_LEVEL_UP ? 'level-up' : undefined}
                            key={subfolder}
                            folderName={subfolder}
                            onClick={() => props && props.onChangeFolderIntent && props.onChangeFolderIntent(subfolder)}
                        />
                    ))}
                </CardDeck>
                <CardDeck className="images">
                    {images.map((image, i) => {
                        return (
                            <ImageCard
                                key={image}
                                url={image}
                                onClick={() => props.onSwitchToViewingIntent(i)}
                            />
                        );
                    })}
              </CardDeck>
            </InfiniteScroll>
    );
}

export default Folders;

export const FOLDER_LEVEL_UP = '⇖';
