import jwt from 'jsonwebtoken';

const getUserId = (request) => {
    const header = request.request.headers.authorization;

    if (!header) {
        throw new Error('Authentication required');
    }

    // get token without the Bearer string
    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, "48Lyw%<x'EbQ+<SR");

    return decoded.userId;
}

export { getUserId as default };