// tslint:disable
// this is an auto generated file. This will be overwritten

export const listImages = `query ListImages($path: String, $limit: Int, $nextToken: String) {
  listImages(path: $path, limit: $limit, nextToken: $nextToken) {
    items {
      url
    }
    nextToken
  }
}
`;
export const listSubfolders = `query ListSubfolders($path: String) {
  listSubfolders(path: $path)
}
`;
export const getSignedCookies = `query GetSignedCookies {
  getSignedCookies {
    name
    value
  }
}
`;
