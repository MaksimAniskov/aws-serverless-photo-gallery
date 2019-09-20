import React from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import Swipe from 'react-easy-swipe';

import * as data from '../data';
import Note from './Note';

import * as utils from "../utils";

interface Props {
    path: string,
    index: number,
    onNoPhotos?: () => void,
    history: any
}

const Gallery: React.FunctionComponent<Props> = (props) => {

    const context = data.useContext();
    const [{ isLoading, images, hasMoreImages }] = context;

    const [windowDimensions, setWindowDimensions] = React.useState({ width: 0, height: 0 });
    React.useEffect(
        () => {
            window.addEventListener('resize', updateWindowDimensions);
            updateWindowDimensions();
            data.useFetchSubfoldersAndSomeImages(context, props.path);

            return () => {
                window.removeEventListener('resize', updateWindowDimensions);
            };
        },
        [context, props.path]
    );

    function updateWindowDimensions() {
        setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    }

    type TSwipeMove = { x: number };
    let swipe: TSwipeMove;
    return (
        <Swipe
            onSwipeMove={(position: TSwipeMove) => { swipe = position }}
            onSwipeEnd={() => swipe.x < 0 ? next() : prev()}
        >
            <KeyboardEventHandler handleKeys={['right', 'down', 'pagedown', 'space', 'enter']}
                onKeyEvent={(key: any, e: React.SyntheticEvent) => next(e)} />
            < KeyboardEventHandler handleKeys={['left', 'up', 'pageup']}
                onKeyEvent={(key: any, e: React.SyntheticEvent) => prev(e)} />

            {(() => {
                if (isLoading) return <Note caption="Loading..." />;
                if (!images.length) {
                    props.onNoPhotos && props.onNoPhotos();
                    return <Note caption="No photos" />;
                }
                if (props.index >= images.length) {
                    return <Note caption="The end" />;
                } else {
                    return (
                        <div>
                            <img
                                src={generateImageUrl(images[props.index])}
                                className="center"
                                alt={images[props.index]}
                            />

                            { // Hidden next photo to force caching it upfront
                                props.index + 1 < images.length &&
                                <img width="0" height="0"
                                    src={generateImageUrl(images[props.index+1])}
                                    alt={''}
                                />
                            }
                            { // Hidden prev photo to force caching it upfront
                                props.index > 0 &&
                                <img width="0" height="0"
                                    src={generateImageUrl(images[props.index-1])}
                                    alt={''}
                                />
                            }
                        </div>
                    );
                }
            })()}
        </Swipe>
    );

    function generateImageUrl(image: string) {
        const imgDimensions = approximateWindowsDimensions();
        return '/image/' +
            utils.base64encode(JSON.stringify({
                key: image,
                edits: { resize: { width: imgDimensions.width, height: imgDimensions.height, fit: 'contain' } }
            }));
    }

    function prev(e?: React.SyntheticEvent) {
        e && e.preventDefault();
        if (props.index > 0) {
            props.history.push(props.history.location.pathname + '?' + (props.index - 1));
        }
    }

    function next(e?: React.SyntheticEvent) {
        e && e.preventDefault();
        if (props.index >= images.length) {
            return;
        } else if (props.index + 1 >= images.length && hasMoreImages) {
            data.useFetchMoreImages(context);
        }
        props.history.push(props.history.location.pathname + '?' + (props.index + 1));
    }

    function approximateWindowsDimensions() {
        return {
            width: approximateDimension(windowDimensions.width),
            height: approximateDimension(windowDimensions.height)
        };

        function approximateDimension(value: number) {
            return Math.max(100, Math.floor(value / 50) * 50);
        }

    }

}

export default Gallery;
