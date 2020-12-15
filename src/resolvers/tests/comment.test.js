import 'cross-fetch/polyfill';

import prisma from '../../prisma';
import seedDB, {
    userOne,
    userTwo,
    commentOne,
    commentTwo,
} from '../../../tests/utils/seedDB';
import getClient from '../../../tests/utils/getClient';
import { deleteComment } from '../../../tests/utils/operations';

const client = getClient();

beforeEach(seedDB);

test('Should delete my own comment', async () => {
    const client = getClient(userTwo.jwt);
    const variables = {
        id: commentTwo.comment.id,
    };

    const { data } = await client.mutate({ mutation: deleteComment, variables });
    const exists = await prisma.exists.Comment({ id: data.deleteComment.id });
    expect(exists).toBe(false);
});

test('Should not be able to delete comment of other user', async () => {
    const client = getClient(userOne.jwt);
    const variables = {
        id: commentTwo.comment.id,
    };
    await expect(client.mutate({ mutation: deleteComment, variables })).rejects.toThrow();
});