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

const userTwo = {
    input: {
        name: 'Rob',
        email: 'rob@example.com',
        password: bcrypt.hashSync('Pass1234!'),
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

const commentOne = {
    input: {
        text: 'this is the first comment',
    },
    comment: undefined,
};

const commentTwo = {
    input: {
        text: 'this is the second comment',
    },
    comment: undefined,
};

const seedDB = async () => {
    jest.setTimeout(100000);
    // delete test data
    await prisma.mutation.deleteManyComments();
    await prisma.mutation.deleteManyPosts();
    await prisma.mutation.deleteManyUsers();
    
    // create user one
    userOne.user = await prisma.mutation.createUser({
        data: userOne.input,
    });
    userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET);

    // create user two
    userTwo.user = await prisma.mutation.createUser({
        data: userTwo.input,
    });
    userTwo.jwt = jwt.sign({ userId: userTwo.user.id }, process.env.JWT_SECRET);

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

    // create comment one and two
    commentOne.comment = await prisma.mutation.createComment({
        data: {
            ...commentOne.input,
            author: {
                connect: {
                    id: userOne.user.id,
                },
            },
            post: {
                connect: {
                    id: postOne.post.id,
                },
            },
        },
    });

    commentTwo.comment = await prisma.mutation.createComment({
        data: {
            ...commentTwo.input,
            author: {
                connect: {
                    id: userTwo.user.id,
                },
            },
            post: {
                connect: {
                    id: postOne.post.id,
                },
            },
        },
    });
};

export { seedDB as default, userOne, userTwo, postOne, postTwo, commentOne, commentTwo };