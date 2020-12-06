import { GraphQLServer, PubSub } from 'graphql-yoga';

import db from './db';
import Query from './resolvers/Query';
import Mutation from './resolvers/Mutation';
import Subscription from './resolvers/Subscription';

import User from './resolvers/User';
import Post from './resolvers/Post';
import Comment from './resolvers/Comment';
import prisma from './prisma';

const pubsub = new PubSub();

// Resolvers
const resolvers = {
    Query,
    Mutation,
    Subscription,
    User,
    Post,
    Comment,
};

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context(request) {
        return {
            db,
            pubsub,
            prisma,
            request,
        };
    }
});

server.start(() => {
    console.log('the server is up!');
});