import { Router } from "express";
import pool from '../database.js';
import { verifyToken, isAdmin } from "../auth/auth.js";

const router = Router();

router.get('/add', verifyToken, (req, res) => {
    res.render('participants/add');
});

router.post('/add', verifyToken, async(req, res) => {
    try {
        const {name, lastname, round, points} = req.body;
        const newPersona = {
            name, lastname, round, points
        }
        await pool.query('INSERT INTO participants SET ?', [newPersona])
        res.redirect('/list');
    } catch (error) {
        res.status(500).json({message:error.message})
    }
});

router.get('/list', async(req, res) => {
    try {
        const [result] = await pool.query('SELECT * FROM participants');
        res.render('participants/list', {participants: result});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
});

router.get('/competition', async(req, res) => {
    try {
        const [result] = await pool.query('SELECT id, name, lastname, points FROM participants ORDER BY points DESC');

        const participantsWithPlaces = result.map((participant, index) => ({
            ...participant,
            place: index + 1, 
        }));

        res.render('participants/competition', { participants: participantsWithPlaces });
    } catch (error) {
        res.status(500).json({message:error.message});
    }
});

router.get('/edit/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const [persona] = await pool.query('SELECT * FROM participants WHERE id = ?', [id]);
        const personaEdit = persona[0];
        res.render('participants/edit', {persona: personaEdit});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
});

router.post('/edit/:id', async(req, res) => {
    try {
        const {name, lastname, round, points} = req.body;
        const {id} = req.params;
        const editPersona = {name, lastname, round, points};
        await pool.query('UPDATE participants SET ? WHERE id = ?', [editPersona, id]);
        res.redirect('/list');
    } catch (error) {
       res.status(500).json({message:error.message}) 
    }
});

router.get('/delete/:id', async(req, res) => {
    try {
        const {id} = req.params;
        await pool.query('DELETE FROM participants WHERE id = ?', [id]);
        res.redirect('/list');
    } catch (error) {
        res.status(500).json({message:error.message});
    }
});

export default router;