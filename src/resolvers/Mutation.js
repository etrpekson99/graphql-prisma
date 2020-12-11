import bycrypt from 'bcryptjs';

import getUserId from '../utils/getUserId';
import generateToken from '../utils/generateToken';
import hashPassword from '../utils/hashPassword';

const Mutations = {
    async signIn(parent, args, { prisma }, info) {
        const user = await prisma.query.user({
            where: { email: args.data.email },
        });

        if (!user) {
            throw new Error('Unable to login');
        }

        const { password } = user;

        const isMatch = await bycrypt.compare(args.data.password, password);
        if (!isMatch) {
            throw new Error('Unable to login');
        }

        return {
            user,
            token: generateToken(user.id),
        };
    },

    async createUser(parent, args, { prisma }, info) {
        const emailTaken = await prisma.exists.User({ email: args.data.email });

        if (emailTaken) {
            throw new Error('Email taken');
        }

        const password = await hashPassword(args.data.password);
        const user = await prisma.mutation.createUser({
            data: {
                ...args.data,
                password,
            }
        });
       
        return {
            user,
            token: generateToken(user.id),
        };
    },
    async createPost(parent, args, { prisma, request }, info) {
        const userId = getUserId(request);
        const userExists = await prisma.exists.User({ id: args.data.author });

        if (!userExists) {
            throw new Error('Author does not exist');
        }

        const newPost = await prisma.mutation.createPost({
            data: {
                title: args.data.title,
                body: args.data.body,
                published: args.data.published,
                author: {
                    connect: {
                        id: userId,
                    }
                }
            },
        }, info);

        return newPost;
    },
    async createComment(parent, { data }, { prisma, request }, info){
        const userId = getUserId(request);
        const postExists = await prisma.exists.Post({
            id: data.post,
            published: true,
        });

        if (!postExists) {
            throw new Error('Post does not exist');
        }

        const newComment = await prisma.mutation.createComment({
            data: {
                text: data.text,
                author: {
                    connect: { id: userId },
                },
                post: {
                    connect: { id: data.post },
                },
            },
        }, info);

        return newComment;
    },

    async deleteUser(parent, args, { prisma, request }, info) {
        const userId = getUserId(request);
    
        const deletedUser = await prisma.mutation.deleteUser({
            where: { id: userId },
        }, info);

        return deletedUser;
    },
    async deletePost(parent, { id }, { prisma, request }, info) {
        const userId = getUserId(request);
        const postExists = await prisma.exists.Post({
            id,
            author: {
                id: userId,
            },
        });

        if (!postExists) {
            throw new Error('Unable to find post');
        }

        const deletedPost = await prisma.mutation.deletePost({ where: { id } });
        return deletedPost;
    },
    async deleteComment(parent, { id }, { prisma, request }, info) {
        const userId = getUserId(request);
        const commentExists = await prisma.exists.Comment({
            id,
            author: { id: userId }
        });

        if (!commentExists) {
            throw new Error('Unable to delete conmment');
        }

        const deletedComment = await prisma.mutation.deleteComment({
            where: { id },
        }, info);

        return deletedComment;
    },

    async updateUser(parent, { id, data }, { prisma, request }, info) {
        const userId = getUserId(request);

        if (typeof data.password === 'string') {
            data.password = await hashPassword(data.password);
        }

        return prisma.mutation.updateUser({
            where: { id: userId },
            data,
        }, info);
    },

    async updatePost(parent, { id, data }, { prisma, request }, info) {
        const userId = getUserId(request);
        const postExists = await prisma.exists.Post({
            author: {
                id: userId
            },
            id,
        });

        const isPublished = await prisma.exists.Post({
            id,
            published: true,
        });

        if (!postExists) {
            throw new Error('Cannot find post');
        }

        if (isPublished && data.published === false) {
            await prisma.mutation.deleteManyComments({
                where: {
                    post: { id },
                },
            });
        }

        const updatedPost = await prisma.mutation.updatePost({
            where: { id },
            data,
        }, info);

        return updatedPost;
    },

    async updateComment(parent, { id, data }, { prisma, request }, info) {
        const userId = getUserId(request);
        const commentExists = await prisma.exists.Comment({
            id,
            author: { id: userId },
        });

        if (!commentExists) {
            throw new Error('Unable to update comment');
        }

        const newComment = await prisma.mutation.updateComment({
            where: { id },
            data: {
                text: data.text,
            },
        }, info);

        return newComment;
    }
};

export { Mutations as default };