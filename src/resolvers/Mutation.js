import bycrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import getUserId from '../utils/getUserId';

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
            token: jwt.sign({ userId: user.id }, "48Lyw%<x'EbQ+<SR"),
        };
    },

    async createUser(parent, args, { prisma }, info) {
        if (args.data.password.length < 8) {
            throw new Error('Password must be 8 characters or longer');
        }

        const emailTaken = await prisma.exists.User({ email: args.data.email });

        if (emailTaken) {
            throw new Error('Email taken');
        }

        const password = await bycrypt.hash(args.data.password, 10);
        const user = await prisma.mutation.createUser({
            data: {
                ...args.data,
                password,
            }
        });
       
        return {
            user,
            token: jwt.sign({ userId: user.id }, "48Lyw%<x'EbQ+<SR"),
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
    async createComment(parent, { data }, { prisma }, info){
        const userExists = await prisma.exists.User({ id: data.author });
        const postExists = await prisma.exists.Post({ id: data.post });

        if (!postExists) {
            throw new Error('Post does not exist');
        }

        if (!userExists) {
            throw new Error('User does not exist');
        }

        const newComment = await prisma.mutation.createComment({
            data: {
                text: data.text,
                author: {
                    connect: { id: data.author },
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
    async deleteComment(parent, { id }, { prisma }, info) {
        const commentExists = await prisma.exists.Comment({ id });

        if (!commentExists) {
            throw new Error('Comment does not exist');
        }

        const deletedComment = await prisma.mutation.deleteComment({
            where: { id },
        }, info);

        return deletedComment;
    },

    async updateUser(parent, { id, data }, { prisma, request }, info) {
        const userId = getUserId(request);

        return prisma.mutation.updateUser({
            where: { id: userId },
            data,
        }, info);
    },

    async updatePost(parent, { id, data }, { prisma }, info) {
        const postExists = await prisma.exists.Post({ id });

        if (!postExists) {
            throw new Error('Post does not exist');
        }

        const updatedPost = await prisma.mutation.updatePost({
            where: { id },
            data,
        }, info);

        return updatedPost;
    },

    async updateComment(parent, { id, data }, { prisma }, info) {
        const commentExists = await prisma.exists.Comment({ id });

        if (!commentExists) {
            throw new Error('Comment does not exist');
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