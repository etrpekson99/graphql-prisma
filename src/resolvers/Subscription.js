const Subscription = {
    comment: {
        subscribe(parent, args, ctx, info) {
            const { postId } = args;
            const { db, pubsub } = ctx;
            const post = db.posts.find(post => post.id === postId && post.published);

            if (!post) {
                throw new Error('Post does not exist');
            }

            return pubsub.asyncIterator(`COMMENT ${postId}`);
        }
    },

    post: {
        subscribe(parent, args, ctx, info) {
            const { pubsub } = ctx;

            return pubsub.asyncIterator('POST');
        }
    }
};

export { Subscription as default };