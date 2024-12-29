import { Router } from 'express';
import bcrypt from 'bcrypt';
import pool from '../database.js';
import { generateToken } from '../auth/auth.js';

const router = Router();

// Login de usuario
router.post('/auth/login', async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
      return res.status(400).json({ message: 'Nombre y contraseña son obligatorios' });
  }

  try {
      const [users] = await pool.query('SELECT * FROM users WHERE name = ?', [name]);

      if (users.length === 0) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const user = users[0];

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
          return res.status(401).json({ message: 'Contraseña incorrecta' });
      }

      const token = generateToken(user);
      res.json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// Registrar un usuario (solo admin puede acceder a esta ruta)
router.post('/auth/register', async (req, res) => {
  const { name, role, password } = req.body;

  if (!name || !role || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = { name, password: hashedPassword, role };
      const [result] = await pool.query('INSERT INTO users SET ?', [newUser]);

      if (result.affectedRows > 0) {
          res.json({ message: 'Usuario registrado exitosamente' });
      } else {
          throw new Error('No se pudo registrar el usuario');
      }
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});


export default router;
