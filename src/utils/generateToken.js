import jwt from 'jsonwebtoken';
const generateToken = userId => {
    return jwt.sign({ userId }, "48Lyw%<x'EbQ+<SR", { expiresIn: '7 days' });
};

export { generateToken as default };