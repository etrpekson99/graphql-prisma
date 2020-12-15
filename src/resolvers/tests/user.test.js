import 'cross-fetch/polyfill';

import prisma from '../../prisma';
import seedDB, { userOne } from '../../../tests/utils/seedDB';
import getClient from '../../../tests/utils/getClient';
import {
    getProfile,
    login,
    getUsers,
    createUser,
} from '../../../tests/utils/operations'

const client = getClient();

beforeEach(seedDB);

test('Should create a new user', async () => {
    const variables = {
        data: {
            name: "Brolly",
            email: "brolly@example.com",
            password: "pass1234",
        },
    };
    const response = await client.mutate({ mutation: createUser, variables });
    const exists = await prisma.exists.User({ id: response.data.createUser.user.id });
    expect(exists).toBe(true);
});

test('Should expose public author profiles', async () => {
    const res = await client.query({ query: getUsers });

    expect(res.data.users.length).toBe(2);
    expect(res.data.users[0].email).toBe(null);
    expect(res.data.users[0].name).toBe('Jen');
});

test('Should not login with bad credentials', async () => {
    const variables = {
        data: {
            email: "jen@example.com",
            password: "badpass",
        }
    };
    
    await expect(client.mutate({ mutation: login, variables })).rejects.toThrow();
});

test('Should not be able to sign up with short password', async () => {
    const variables = {
        data: {
            email:"sample@example.com",
            password:"short",
            name:"Harry"
        },
    }

    await expect(client.mutate({ mutation: createUser, variables })).rejects.toThrow();
});

test('Should fetch user profile', async () => {
    const client = getClient(userOne.jwt);

    const { data } = await client.query({ query: getProfile });
    expect(data.me.id).toBe(userOne.user.id);
});