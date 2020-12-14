import { gql } from 'apollo-boost';

const createUser = gql`
    mutation($data:CreateUserInput!) {
        createUser(data: $data){
            token,
            user {
                id
                name
                email
            }
        }
    }
`;

const getUsers = gql`
    query {
        users {
            id
            name
            email
        }
    }
`;

const login = gql`
    mutation($data:LogInUserInput!) {
        signIn(data: $data){ token }
    }
`;

const getProfile = gql`
    query {
        me {
            id
            name
            email
        }
    }
`;

const getPosts = gql`
    query {
        posts {
            id
            title
            published
        }
    }
`;

const getMyPosts = gql`
    query {
        myPosts {
            id
            title
            published
        }
    }
`;

const updatePost = gql`
    mutation($id: ID!, $data: UpdatePostInput!) {
        updatePost(
            id: $id
            data: $data
        ) {
            id
            title
            published
        }
    }
`;

const createPost = gql`
    mutation($data: CreatePostInput!) {
        createPost(data: $data) {
            id
            title
            published
        }
    }
`;

const deletePost = gql`
    mutation($id:ID!) {
        deletePost(id: $id) {
            id
            title
        }
    }
`;

export {
    createUser,
    login,
    getUsers,
    getProfile,
    getPosts,
    getMyPosts,
    updatePost,
    createPost,
    deletePost,
};