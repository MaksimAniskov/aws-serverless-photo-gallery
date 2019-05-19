import React from 'react';
import { API, graphqlOperation } from 'aws-amplify';
// eslint-disable-next-line no-unused-vars
import { GraphQLResult } from '@aws-amplify/api/lib/types';

// eslint-disable-next-line no-unused-vars
import { ListSubfoldersQuery, ListImagesQuery } from '../API';
import { listImages } from '../graphql/queries';

interface IState {
    isLoading: boolean,
    error?: string,
    folderName?: string,
    subfolders: string[],
    images: string[],
    nextToken?: string,
    hasMoreImages: boolean
}

enum ActionType {
    // eslint-disable-next-line no-unused-vars
    loading = 'loading',
    // eslint-disable-next-line no-unused-vars
    loaded = 'loaded',
    // eslint-disable-next-line no-unused-vars
    error = 'error',
    // eslint-disable-next-line no-unused-vars
    clearError = 'clearError',
    // eslint-disable-next-line no-unused-vars
    folderName = 'folderName',
    // eslint-disable-next-line no-unused-vars
    subfolders = 'subfolders',
    // eslint-disable-next-line no-unused-vars
    addImages = 'addImages',
    // eslint-disable-next-line no-unused-vars
    nextToken = 'nextToken'
}

type Action =
    | {
        type: ActionType.loading
    }
    | {
        type: ActionType.loaded
    }
    | {
        type: ActionType.error,
        error: string
    }
    | {
        type: ActionType.clearError
    }
    | {
        type: ActionType.folderName,
        folderName: string
    }
    | {
        type: ActionType.subfolders,
        subfolders: string[]
    }
    | {
        type: ActionType.addImages,
        images: string[]
    }
    | {
        type: ActionType.nextToken,
        nextToken?: string
    }

type Context = [IState, React.Dispatch<Action>];

const reducer = (state: IState, action: Action): IState => {
    switch (action.type) {
        case ActionType.folderName:
            return {
                ...state,
                folderName: action.folderName,
                nextToken: undefined,
                subfolders: [],
                images: [],
                hasMoreImages: false
            };
        case ActionType.loading: return { ...state, isLoading: true };
        case ActionType.loaded: return { ...state, isLoading: false };
        case ActionType.error: return { ...state, error: action.error };
        case ActionType.clearError: return { ...state, error: undefined };
        case ActionType.subfolders: return { ...state, subfolders: action.subfolders };
        case ActionType.addImages: return { ...state, images: state.images.concat(action.images) };
        case ActionType.nextToken:
            return {
                ...state,
                nextToken: action.nextToken,
                hasMoreImages: !!action.nextToken
            };
        default: return state;
    }
};

const StateContext = React.createContext<Context>(null as unknown as Context);

export const StateProvider: React.FunctionComponent<{}> = (props) => {
    const initialState: IState = {
        subfolders: [],
        images: [],
        isLoading: false,
        hasMoreImages: false,
    };
    return (
        <StateContext.Provider
            value={React.useReducer<React.Reducer<IState, Action>>(reducer, initialState)}
        >
            {props.children}
        </StateContext.Provider>
    );
};

export const useContext = () => React.useContext(StateContext);

export const useFetchSubfoldersAndSomeImages = async (context: Context, folderName: string) => {
    const [state, dispatch] = context;
    if (folderName === state.folderName) {
        return;
    }
    dispatch({ type: ActionType.folderName, folderName });
    await performQuery(context, folderName.slice(1), ListSubfoldersAndImagesQuery);
}

export const useFetchMoreImages = async (context: Context) => {
    const [state] = context;
    if (state.isLoading) return;
    if (!state.folderName) {
        console.error('Call useFetchSubfoldersAndSomeImages before calling useFetchMoreImages');
        return;
    }
    await performQuery(context, state.folderName.slice(1), listImages);
}

async function performQuery(context: Context, folderName: string, query: string) {
    const [state, dispatch] = context;

    dispatch({ type: ActionType.loading });
    dispatch({ type: ActionType.clearError });

    try {
        const params = {
            path: folderName,
            nextToken: state.nextToken
        };
        const result = await API.graphql(graphqlOperation(query, params)) as GraphQLResult;

        const foldersData = (result.data as ListSubfoldersQuery).listSubfolders;
        if (foldersData) {
            dispatch({
                type: ActionType.subfolders,
                subfolders: (foldersData as string[]).filter(folder => folder !== '')
            });
        }

        const imagesData = (result.data as ListImagesQuery).listImages;
        if (imagesData) {
            if (imagesData.items) {
                dispatch({
                    type: ActionType.addImages,
                    images: imagesData.items
                        .filter(item => !!item)
                        .map(item => item!.url) as string[]
                });
            }
            dispatch({
                type: ActionType.nextToken,
                nextToken: imagesData.nextToken ? imagesData.nextToken : undefined
            });
        }
    } catch (result) {
        console.error(result);
        dispatch({ type: ActionType.error, error: 'Oops... Something went wrong.' });
    } finally {
        dispatch({ type: ActionType.loaded });
    }
}

const ListSubfoldersAndImagesQuery = `query ListSubfoldersAndImages($path: String) {
    listSubfolders(path: $path),
    listImages(path: $path) {
        items {
          url
        }
        nextToken
    }
  }`;
