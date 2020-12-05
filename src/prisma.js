import { Prisma } from 'prisma-binding';

const prisma = new Prisma({
    typeDefs: 'src/generated/prisma.graphql',
    endpoint: 'http://localhost:4466',
});

export { prisma as default };

// const createPostForUser = async (authorId, data) => {
//     const userExists = await prisma.exists.User({
//         id: authorId
//     });

//     if (!userExists) {
//         throw new Error('User does not exist');
//     }

//     const post = await prisma.mutation.createPost({
//         data: {
//             ...data,
//             author: {
//                 connect: { id: authorId },
//             },
//         },
//     }, '{ author { id name email posts { id title published } } }');

//     return post.author;
// };

// const updatePostForUser = async (postId, data) => {
//     const postExists = await prisma.exists.Post({
//         id: postId,
//     });

//     if (!postExists) {
//         throw new Error('Post does not exist');
//     }

//     const post = await prisma.mutation.updatePost({
//         where: { id: postId },
//         data,
//     }, '{ author { id name email posts { id title published } } }');

//     return post.author;
// };

// updatePostForUser("cki96uwtj01390903cqxynk57", { published: false, title: 'A new title' }).then(user => {
//     console.log(JSON.stringify(user, undefined, 2));
// }).catch(err =>{ console.log(err.message) });

// createPostForUser("cki7pobe505c90919ig9dmiwr", {
//     title: 'Great books to read',
//     body: 'War of Art',
//     published: true,
// }).then(user => {
//     console.log(JSON.stringify(user, undefined, 2));
// }).catch(err => {
//     console.log(err.message);
// });



