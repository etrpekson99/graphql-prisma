import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../src/prisma';

const userOne = {
    input: {
        name: 'Jen',
        email: 'jen@example.com',
        password: bcrypt.hashSync('Red098!@#$')
    },
    user: undefined,
    jwt: undefined,
};

const postOne = {
    input: {
        title: 'My published post',
        body: '',
        published: true,
    },
    post: undefined,
};

const postTwo = {
    input: {
        title: 'My draft post',
        body: '',
        published: false,
    },
    post: undefined,
};

const seedDB = async () => {
    jest.setTimeout(100000);
    // delete test data
    await prisma.mutation.deleteManyPosts();
    await prisma.mutation.deleteManyUsers();
    
    // create user one
    userOne.user = await prisma.mutation.createUser({
        data: userOne.input,
    });
    userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET);

    // create post one
    postOne.post = await prisma.mutation.createPost({
        data: {
            ...postOne.input,
            author: {
                connect: {
                    id: userOne.user.id,
                },
            },
        },
    });

    // create post 2
    postTwo.post = await prisma.mutation.createPost({
        data: {
            ...postTwo.input,
            author: {
                connect: {
                    id: userOne.user.id,
                }
            }
        }
    });
};

export { seedDB as default, userOne, postOne, postTwo };