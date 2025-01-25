import { Router } from "express";
import pool from '../database.js';

const router = Router();

router.get('/add', async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories');
        const [subcategories] = await pool.query('SELECT * FROM subcategories');

        res.render('participants/add', { categories, subcategories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar la página');
    }
});

router.post('/add', async (req, res) => {
    const { name, lastname, points, category_id, subcategory_id } = req.body;

    try {
        const query = `
            INSERT INTO participants (name, lastname, points, category_id, subcategory_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        await pool.query(query, [name, lastname, points, category_id, subcategory_id]);
        res.redirect('/list'); // Redirigir a una página de lista de participantes o donde prefieras
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear el participante');
    }
});

router.get("/series", async (req, res) => {
    try {
      const [participants] = await pool.execute("SELECT * FROM participants");
  
      res.render("participants/series", { participants });
    } catch (error) {
      console.error("Error al obtener participantes:", error.message);
      res.status(500).send("Error al cargar la vista de series.");
    }
  });
  
router.post('/series/:participantId', async (req, res) => {
    const { participantId } = req.params;
    const { series } = req.body; // `series` debe ser un array con las series y flechas

    if (!Array.isArray(series) || series.length === 0) {
        return res.status(400).json({ error: 'Debes proporcionar al menos una serie con flechas.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Validar si el participante existe
        const [participant] = await connection.query(
            'SELECT id FROM participants WHERE id = ?',
            [participantId]
        );

        if (participant.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Participante no encontrado' });
        }

        // Insertar series y flechas
        for (const serie of series) {
            const { series_number, arrows } = serie;

            if (!series_number || !Array.isArray(arrows) || arrows.length === 0) {
                throw new Error(
                    'Cada serie debe tener un `series_number` y al menos una flecha.'
                );
            }

            // Insertar la serie
            const [result] = await connection.query(
                'INSERT INTO series (participant_id, series_number) VALUES (?, ?)',
                [participantId, series_number]
            );

            const seriesId = result.insertId;

            // Insertar flechas asociadas a la serie
            const arrowData = arrows.map(arrow => [
                seriesId,
                arrow.arrow_number,
                arrow.points,
            ]);

            await connection.query(
                'INSERT INTO arrows (series_id, arrow_number, points) VALUES ?',
                [arrowData]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Series y flechas creadas con éxito.' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Error al crear series y flechas.' });
    } finally {
        connection.release();
    }
});

router.get('/list', async (req, res) => {
    try {
        const query = 
            `SELECT 
                p.id AS participant_id, 
                p.name AS participant_name, 
                p.lastname AS participant_lastname, 
                p.points AS participant_points,
                c.name AS category_name, 
                sc.name AS subcategory_name,
                s.series_number,
                a.arrow_number,
                a.points AS arrow_points
            FROM participants p
            INNER JOIN categories c ON p.category_id = c.id
            INNER JOIN subcategories sc ON p.subcategory_id = sc.id
            LEFT JOIN series s ON p.id = s.participant_id
            LEFT JOIN arrows a ON s.id = a.series_id
            ORDER BY p.id, s.series_number, a.arrow_number;`;
        

        const [result] = await pool.query(query);

        // Agrupar los datos por participante para renderizar más fácilmente
        const participants = {};
        result.forEach(row => {
            const participantId = row.participant_id;

            if (!participants[participantId]) {
                participants[participantId] = {
                    id: participantId,
                    name: row.participant_name,
                    lastname: row.participant_lastname,
                    points: row.participant_points,
                    category: row.category_name,
                    subcategory: row.subcategory_name,
                    series: [],
                };
            }

            // Agregar series y flechas
            const seriesIndex = row.series_number - 1;
            if (!participants[participantId].series[seriesIndex]) {
                participants[participantId].series[seriesIndex] = {
                    series_number: row.series_number,
                    arrows: [],
                };
            }
            participants[participantId].series[seriesIndex].arrows.push({
                arrow_number: row.arrow_number,
                points: row.arrow_points,
            });
        });

        res.render('participants/list', { participants: Object.values(participants) });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar la lista de participantes');
    }
});  

router.get('/competition', async (req, res) => {
    const { category, subcategory } = req.query;

    try {
        const query = `
            SELECT 
                p.id, 
                p.name, 
                p.lastname, 
                p.points, 
                c.name AS category_name, 
                sc.name AS subcategory_name
            FROM participants p
            JOIN categories c ON p.category_id = c.id
            JOIN subcategories sc ON p.subcategory_id = sc.id
            WHERE (? IS NULL OR c.name = ?)
              AND (? IS NULL OR sc.name = ?)
            ORDER BY p.points DESC;
        `;

        const [result] = await pool.query(query, [category, category, subcategory, subcategory]);

        const participantsWithPlaces = result.map((participant, index) => ({
            ...participant,
            place: index + 1, // Asignar el lugar basado en puntos
        }));

        res.render('participants/competition', { 
            participants: participantsWithPlaces,
            category: category || 'Todas las categorías', 
            subcategory: subcategory || 'Todas las subcategorías',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/edit/:id', async(req, res) => {
    try {
        const {id} = req.params;

        const [persona] = await pool.query('SELECT * FROM participants WHERE id = ?', [id]);
        const [categories] = await pool.query('SELECT * FROM categories');
        const [subcategories] = await pool.query('SELECT * FROM subcategories');

        res.render('participants/edit', {
            persona: persona[0],
            categories,
            subcategories,
        });
    } catch (error) {
        res.status(500).json({message:error.message});
    }
});

router.post('/edit/:id', async(req, res) => {
    try {
        const {name, lastname, points, category_id, subcategory_id} = req.body;
        const {id} = req.params;
        const editPersona = {name, lastname, points, category_id, subcategory_id};
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

router.get('/filter', async (req, res) => {
    try {
        const { category, subcategory } = req.query;

        const query = `
            SELECT p.id, p.name, p.lastname, p.points, c.name AS category, s.name AS subcategory
            FROM participants p
            INNER JOIN categories c ON p.category_id = c.id
            INNER JOIN subcategories s ON p.subcategory_id = s.id
            WHERE c.name = ? AND s.name = ?
        `;
        const [result] = await pool.query(query, [category, subcategory]);

        res.render('participants/filter', { participants: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;