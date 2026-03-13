import jwt from 'jsonwebtoken';

const generateToken = (id, roles) => {
    return jwt.sign({ id, roles }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

export default generateToken;