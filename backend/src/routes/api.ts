import { Router } from 'express';
import { query } from '../database/db';

const router = Router();

// GET all missions with client details
router.get('/missions', async (req, res) => {
    try {
        const result = await query(`
      SELECT 
        m.*,
        c.name as client_name
      FROM missions m
      LEFT JOIN clients c ON m.client_id = c.id
      ORDER BY m.month DESC, m.created_at DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching missions:', error);
        res.status(500).json({ error: 'Failed to fetch missions' });
    }
});

// POST create new mission
router.post('/missions', async (req, res) => {
    try {
        const {
            title,
            month,
            client_id,
            apporteur_id,
            amount_billed,
            initial_fees,
            agency_fees,
            fixed_fees,
            management_fees,
            ml_amount,
            lt_amount,
            apporteur_commission,
            distributions
        } = req.body;

        // Calculate remainder and base for distribution
        const remainder = parseFloat(amount_billed) - parseFloat(initial_fees || 0);
        const before_commissions = remainder - parseFloat(agency_fees || 0) - parseFloat(fixed_fees || 0) - parseFloat(management_fees || 0) - parseFloat(ml_amount || 0) - parseFloat(lt_amount || 0);
        const base_for_distribution = before_commissions - parseFloat(apporteur_commission || 0);

        // Calculate total distributed
        const total_distributed = distributions ? distributions.reduce((sum: number, d: any) => sum + (base_for_distribution * d.percentage / 100), 0) : 0;
        const reliquat = base_for_distribution - total_distributed;

        const result = await query(
            `INSERT INTO missions (
        title, month, client_id, apporteur_id, amount_billed, initial_fees,
        agency_fees, fixed_fees, management_fees, ml_amount, lt_amount,
        apporteur_commission, remainder, base_for_distribution, reliquat, paid
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
            [
                title, month, client_id, apporteur_id || null, amount_billed, initial_fees || 0,
                agency_fees || 0, fixed_fees || 0, management_fees || 0, ml_amount || 0, lt_amount || 0,
                apporteur_commission || 0, remainder, base_for_distribution, reliquat, false
            ]
        );

        // Insert distributions if provided
        if (distributions && distributions.length > 0) {
            const missionId = result.rows[0].id;
            for (const dist of distributions) {
                await query(
                    `INSERT INTO distributions (mission_id, person_id, percentage, amount)
           VALUES ($1, $2, $3, $4)`,
                    [missionId, dist.person_id, dist.percentage, base_for_distribution * dist.percentage / 100]
                );
            }
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating mission:', error);
        res.status(500).json({ error: 'Failed to create mission' });
    }
});

// PATCH toggle mission paid status
router.patch('/missions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { paid } = req.body;

        const result = await query(
            'UPDATE missions SET paid = $1 WHERE id = $2 RETURNING *',
            [paid, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating mission:', error);
        res.status(500).json({ error: 'Failed to update mission' });
    }
});

// GET all clients
router.get('/clients', async (req, res) => {
    try {
        const result = await query('SELECT * FROM clients ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
});

// GET all persons
router.get('/persons', async (req, res) => {
    try {
        const result = await query('SELECT * FROM persons ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching persons:', error);
        res.status(500).json({ error: 'Failed to fetch persons' });
    }
});

// GET person details with distributions
router.get('/persons/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const personResult = await query('SELECT * FROM persons WHERE id = $1', [id]);
        if (personResult.rows.length === 0) {
            return res.status(404).json({ error: 'Person not found' });
        }

        const distributionsResult = await query(`
      SELECT 
        d.*,
        m.title as mission_title,
        m.month,
        c.name as client_name
      FROM distributions d
      JOIN missions m ON d.mission_id = m.id
      JOIN clients c ON m.client_id = c.id
      WHERE d.person_id = $1
      ORDER BY m.month DESC
    `, [id]);

        res.json({
            person: personResult.rows[0],
            distributions: distributionsResult.rows
        });
    } catch (error) {
        console.error('Error fetching person details:', error);
        res.status(500).json({ error: 'Failed to fetch person details' });
    }
});

// GET recap for a specific month
router.get('/recap/:month', async (req, res) => {
    try {
        const { month } = req.params;

        const missionsResult = await query(`
      SELECT 
        m.*,
        c.name as client_name
      FROM missions m
      LEFT JOIN clients c ON m.client_id = c.id
      WHERE m.month = $1
      ORDER BY m.created_at DESC
    `, [month]);

        const distributionsResult = await query(`
      SELECT 
        d.*,
        p.name as person_name,
        m.title as mission_title,
        c.name as client_name
      FROM distributions d
      JOIN persons p ON d.person_id = p.id
      JOIN missions m ON d.mission_id = m.id
      JOIN clients c ON m.client_id = c.id
      WHERE m.month = $1
      ORDER BY p.name, m.title
    `, [month]);

        // Group distributions by person
        const personDistributions: any = {};
        distributionsResult.rows.forEach((dist: any) => {
            if (!personDistributions[dist.person_id]) {
                personDistributions[dist.person_id] = {
                    person_name: dist.person_name,
                    person_id: dist.person_id,
                    distributions: [],
                    total: 0
                };
            }
            personDistributions[dist.person_id].distributions.push(dist);
            personDistributions[dist.person_id].total += parseFloat(dist.amount);
        });

        res.json({
            missions: missionsResult.rows,
            personDistributions: Object.values(personDistributions)
        });
    } catch (error) {
        console.error('Error fetching recap:', error);
        res.status(500).json({ error: 'Failed to fetch recap' });
    }
});

export default router;
