import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secretKey = process.env.SECRET_KEY; // Cambia esto por una clave más robusta

// Generar un token
export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            name: user.name,
            role: user.role,
        },
        secretKey,
        { expiresIn: '1h' } // Token válido por 1 hora
    );
};

// Verificar el token
export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // El token debería estar en el encabezado

    if (!token) {
        return res.status(401).json({ message: 'Acceso no autorizado, token requerido' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded; // Agregar el usuario decodificado al objeto `req`
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
};

// Middleware para roles
export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
    }
    next();
};
