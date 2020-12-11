import getUserId from '../utils/getUserId';

const Query = {
    users(parent, args, { prisma }, info) {
        const opArgs = {};

        if (args.query) {
            opArgs.where = {
                OR: [
                    { name_contains: args.query },
                    { email_contains: args.query },
                ]
            };
        }

        return prisma.query.users(opArgs, info);
    },
    posts(parent, args, { prisma }, info) {
        const opArgs = {
            where: {
                published: true,
            }
        };
        if (args.query) {
            opArgs.where.OR = [
                { title_contains: args.query },
                { body_contains: args.query },
            ];
        }

        return prisma.query.posts(opArgs, info);
    },
    async myPosts(parent, args, { prisma, request }, info) {
        const userId = getUserId(request);
        const userExists = await prisma.exists.User({ id: userId });

        if (!userExists) throw new Error('Encountered problem fetching this user\'s posts');

        const opArgs = {
            where: {
                author: { id: userId },
            },
        };

        if (args.query) {
            opArgs.where.OR = [
                { title_contains: args.query },
                { body_contains: args.query },
            ];
        }

        return prisma.query.posts(opArgs, info);
    },
    comments(parent, args, { prisma }, info) {
        return prisma.query.comments(null, info);
    },
    async me(parent, args, { prisma, request }, info) {
        const userId = getUserId(request);
        const userExists = await prisma.exists.User({ id: userId });
        if (!userExists) {
            throw new Error('User does not exist');
        }
        
        const user = await prisma.query.user({
            where: { id: userId },
        }, info);

        return user;
    },
    async post(parent, args, { prisma, request }, info) {
        const userId = getUserId(request, false);

        const posts = await prisma.query.posts({
            where: {
                id: args.id,
                OR: [
                    { published: true },
                    { author: { id: userId } },
                ],
            },
        }, info);

        if (posts.length === 0) {
            throw new Error('Post not found');
        }

        return posts[0];
    }
};

export { Query as default };