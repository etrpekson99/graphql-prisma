import 'cross-fetch/polyfill';
import { gql } from 'apollo-boost';

import prisma from '../../prisma';
import seedDB, { userOne, postOne, postTwo } from '../../../tests/utils/seedDB';
import getClient from '../../../tests/utils/getClient';
import {
    getPosts,
    getMyPosts,
    updatePost,
    createPost,
    deletePost,
} from '../../../tests/utils/operations';

const client = getClient();

beforeEach(seedDB);

test('Should expose public posts', async () => {
    const res = await client.query({ query: getPosts });
    expect(res.data.posts.length).toBe(1);
    expect(res.data.posts[0].published).toBe(true);
});

test('Should return my posts', async () => {
    const client = getClient(userOne.jwt);
    const { data } = await client.query({ query: getMyPosts });
    expect(data.myPosts.length).toBe(2);
});

test('Should be able to update own post', async () => {
    const client = getClient(userOne.jwt);
    const variables = {
        id: postOne.post.id,
        data: {
            published: false,
        },
    };

    const { data } = await client.mutate({ mutation: updatePost, variables });
    const exists = await prisma.exists.Post({ id: postOne.post.id, published: false });
    expect(data.updatePost.published).toBe(false);
    expect(exists).toBe(true);
});

test('Should be able to create post', async () => {
    const client = getClient(userOne.jwt);
    const variables = {
        data: {
            title: "New Post",
            body: "",
            published: true,
        },
    };

    const { data } = await client.mutate({ mutation: createPost, variables });
    const exists = await prisma.exists.Post({ id: data.createPost.id });
    expect(exists).toBe(true);
    expect(data.createPost.title).toBe('New Post');
});

test('Should be able to delete post', async () => {
    const client = getClient(userOne.jwt);
    const variables = { id: postTwo.post.id };
    const { data } = await client.mutate({ mutation: deletePost, variables });
    const exists = await prisma.exists.Post({ id: postTwo.post.id });
    expect(exists).toBe(false);
});