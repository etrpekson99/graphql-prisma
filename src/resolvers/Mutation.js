import uuidv4 from 'uuid/v4';

const Mutations = {
    async createUser(parent, args, { prisma }, info) {
        const emailTaken = await prisma.exists.User({ email: args.data.email });

        if (emailTaken) {
            throw new Error('Email taken');
        }

        const user = await prisma.mutation.createUser({
            data: args.data
        }, info);
       
        return user;
    },
    createPost(parent, args, { db, pubsub }) {
        const userExists = db.users.some(user => user.id === args.data.author);

        if (!userExists) {
            throw new Error('User not found');
        }

        const post = {
            id: uuidv4(),
            ...args.data
        };

        db.posts.push(post);
        if (post.published) {
            pubsub.publish('POST', {
                post: {
                    mutation: 'CREATED',
                    data: post,
                },
            });
        }

        return post;
    },
    createComment(parent, args, { db, pubsub }){
        const userExists = db.users.some(user => user.id === args.data.author);
        const postExists = db.posts.some(post => post.id === args.data.post && post.published);

        if (!userExists || !postExists) {
            throw new Error('Unable to find user and post');
        }

        const comment = {
            id: uuidv4(),
            ...args.data
        };

        db.comments.push(comment);
        pubsub.publish(`COMMENT ${args.data.post}`, {
            comment: {
                mutation: 'CREATED',
                data: comment,
            },
        });

        return comment;
    },

    deleteUser(parent, args, { db }, info) {
        const userIndex = db.users.findIndex(user => user.id === args.id);

        if (userIndex === -1) {
            throw new Error('User not found');
        }

        const deletedUsers = db.users.splice(userIndex, 1);

        db.posts = db.posts.filter(post => {
            const match = post.author === args.id;
            
            if (match) {
                db.comments = db.comments.filter(comment => comment.post !== post.id);
            }

            return !match;
        });
        db.comments = db.comments.filter(comment => comment.author !== args.id);

        return deletedUsers[0];
    },
    deletePost(parent, args, { db, pubsub }, info) {
        const postIndex = db.posts.findIndex(post => post.id === args.id);

        if (postIndex === -1) {
            throw new Error('This post does not exist');
        }

        const [post] = db.posts.splice(postIndex, 1);

        db.comments = db.comments.filter(comment => comment.post !== args.id);

        if (post.published) {
            pubsub.publish('POST', {
                post: {
                    mutation: 'DELETED',
                    data: post,
                }
            })
        }

        return post;
    },
    deleteComment(parent, args, { db, pubsub }, info) {
        const commentIndex = db.comments.findIndex(comment => comment.id === args.id);

        if (commentIndex === -1) {
            throw new Error('This comment does not exist');
        }

        const [comment] = db.comments.splice(commentIndex, 1);
        pubsub.publish(`COMMENT ${comment.post}`, {
            comment: {
                mutation: 'DELETED',
                data: comment,
            },
        });

        return comment;
    },

    updateUser(parent, { id, data }, { db }, info) {
        const user = db.users.find(user => user.id === id);

        if (!user) {
            throw new Error('User not found');
        }

        if (typeof data.email === 'string') {
            const emailTaken = db.users.some(user => user.email === data.email);
            if (emailTaken) {
                throw new Error('Email is already taken');
            }

            user.email = data.email;
        }

        if (typeof data.name === 'string') {
            user.name = data.name;
        }

        if (typeof data.age !== 'undefined') {
            user.age === data.age;
        }

        return user;
    },

    updatePost(parent, args, { db, pubsub }, info) {
        const { id, data } = args;
        const post = db.posts.find(post => post.id === id);
        const originalPost = { ...post };

        if (!post) {
            throw new Error('Post does not exist');
        }

        if (typeof data.title === 'string') {
            post.title = data.title;
        }

        if (typeof data.body === 'string') {
            post.body = data.body;
        }

        if (typeof data.published === 'boolean') {
            post.published = data.published;

            if (originalPost.published && !post.published) {
                pubsub.publish('POST', {
                    post: {
                        mutation: 'DELETED',
                        data: originalPost,
                    }
                });
            } else if (!originalPost.published && post.published) {
                pubsub.publish('POST', {
                    post: {
                        mutation: 'CREATED',
                        data: post,
                    }
                });
            }
        } else if (post.published) {
            pubsub.publish('POST', {
                post: {
                    mutation: 'UPDATED',
                    data: post,
                }
            });
        }

        return post;
    },

    updateComment(parent, args, { db, pubsub }, info) {
        const { id, data } = args;
        const comment = db.comments.find(comment => comment.id === id);
        const originalComment = comment;

        if (!comment) {
            console.log('it goes here')
            throw new Error('This comment does not exist');
        }

        if (typeof data.text === 'string') {
            comment.text = data.text;
        }

        pubsub.publish(`COMMENT ${comment.post}`, {
            comment: {
                mutation: 'UPDATED',
                data: comment,
            },
        });

        return comment;
    }
};

export { Mutations as default };