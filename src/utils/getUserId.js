import jwt from 'jsonwebtoken';

const getUserId = (request, requireAuth = true) => {
    const header = request.request ? request.request.headers.authorization : request.connection.context.Authorization;

    if (header) {
        // get token without the Bearer string
        const token = header.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        return decoded.userId;
    }

    if (requireAuth) {
        throw new Error('Authentication required');
    }

    return null;
}

export { getUserId as default };