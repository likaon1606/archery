import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secretKey = process.env.SECRET_KEY;

// Generar un token
export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            name: user.name,
            role: user.role,
        },
        secretKey,
        { expiresIn: '1h' }
    );
};

// Middleware para verificar el token
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader);

    const token = authHeader?.split(' ')[1];
    console.log('Extracted Token:', token);

    if (!token) {
        return res.status(401).json({ message: 'Acceso no autorizado, token requerido' });
    }

    try {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Token inválido o expirado' });
            }
            // Validar propiedades necesarias
            if (!decoded.id || !decoded.name || !decoded.role) {
                return res.status(403).json({ message: 'Token inválido o incompleto' });
            }
            req.user = decoded; // Agregar el usuario decodificado al objeto `req`
            next();
        });
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
};


// Middleware para verificar si es administrador
export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
    }
    next();
};
