/* tslint:disable */
//  This file was automatically generated and should not be edited.

export type ListImagesQueryVariables = {
  path?: string | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListImagesQuery = {
  listImages:  {
    __typename: "ImageConnection",
    items:  Array< {
      __typename: "Image",
      url: string | null,
    } | null > | null,
    nextToken: string | null,
  } | null,
};

export type ListSubfoldersQueryVariables = {
  path?: string | null,
};

export type ListSubfoldersQuery = {
  listSubfolders: Array< string | null > | null,
};

export type GetSignedCookiesQuery = {
  getSignedCookies:  Array< {
    __typename: "Cookie",
    name: string | null,
    value: string | null,
  } | null > | null,
};
