import jwt from 'jsonwebtoken';

const getUserId = (request, requireAuth = true) => {
    const header = request.request.headers.authorization;

    if (header) {
        // get token without the Bearer string
        const token = header.replace('Bearer ', '');
        const decoded = jwt.verify(token, "48Lyw%<x'EbQ+<SR");

        return decoded.userId;
    }

    if (requireAuth) {
        throw new Error('Authentication required');
    }

    return null;
}

export { getUserId as default };