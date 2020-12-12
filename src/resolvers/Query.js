import getUserId from '../utils/getUserId';

const getArgs = args => ({
    first: args.first,
    skip: args.skip,
    after: args.after,
    orderBy: args.orderBy,
});

const Query = {
    users(parent, args, { prisma }, info) {
        const otherArgs = getArgs(args);
        const opArgs = {
            ...otherArgs,
        };

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
        const otherArgs = getArgs(args);
        const opArgs = {
            where: {
                published: true,
            },
            ...otherArgs,
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
        const otherArgs = getArgs(args);

        const opArgs = {
            where: {
                author: { id: userId },
            },
            ...otherArgs,
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
        const otherArgs = getArgs(args);
        const opArgs = {
            ...otherArgs,
        };
        return prisma.query.comments(opArgs, info);
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