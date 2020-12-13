import 'cross-fetch/polyfill';
import ApolloBoost, { gql } from 'apollo-boost';
import bcrypt from 'bcryptjs';
import prisma from '../../prisma';

const client = new ApolloBoost({
    uri: 'http://localhost:4000'
});

beforeEach(async () => {
    jest.setTimeout(10000)
    await prisma.mutation.deleteManyPosts();
    await prisma.mutation.deleteManyUsers();
    const user = await prisma.mutation.createUser({
        data: {
            name: 'Jen',
            email: 'jen@example.com',
            password: bcrypt.hashSync('Red098!@#$')
        },
    });
    await prisma.mutation.createPost({
        data: {
            title: 'My published post',
            body: '',
            published: true,
            author: {
                connect: {
                    id: user.id,
                },
            },
        },
    });
    await prisma.mutation.createPost({
        data: {
            title: 'My draft post',
            body: '',
            published: false,
            author: {
                connect: {
                    id: user.id
                }
            }
        }
    });
});

test('Should create a new user', async () => {
    const createUser = gql`
        mutation {
            createUser(
                data: {
                    name: "Andrew",
                    email: "andrew@example.com",
                    password: "MyPass123"
                }
            ){
                token,
                user {
                    id
                }
            }
        }
    `;

    const response = await client.mutate({ mutation: createUser });

    const exists = await prisma.exists.User({ id: response.data.createUser.user.id });
    expect(exists).toBe(true);
});

test('Should expose public author profiles', async () => {
    const getUsers = gql`
        query {
            users {
                id
                name
                email
            }
        }
    `;

    const res = await client.query({ query: getUsers });

    expect(res.data.users.length).toBe(1);
    expect(res.data.users[0].email).toBe(null);
    expect(res.data.users[0].name).toBe('Jen');
});

test('Should expose public posts', async () => {
    const getPosts = gql`
        query {
            posts {
                id
                title
                published
            }
        }
    `;

    const res = await client.query({ query: getPosts });

    expect(res.data.posts.length).toBe(1);
    expect(res.data.posts[0].published).toBe(true);
});

test('Should not login with bad credentials', async () => {
    const login = gql`
        mutation {
            signIn(
                data: {
                    email:"no-one@example.com",
                    password:"notworking123"
                }
            ){ token }
        }
    `;
    
    await expect(client.mutate({ mutation: login })).rejects.toThrow();
});

test('Should not be able to sign up with short password', async () => {
    const signUp = gql`
        mutation {
            createUser(
                data: {
                    email:"sample@example.com",
                    password:"short",
                    name:"Harry"
                }
            ){ token }
        }
    `;

    await expect(client.mutate({ mutation: signUp })).rejects.toThrow();
});