import { Request, Response } from 'express';

const FASTIFY_URL = process.env.FASTIFY_URL || 'http://localhost:3001';

export const login = async (req: Request, res: Response) => {
    try {
        const response = await fetch(`${FASTIFY_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();

        if (!response.ok) {
            res.status(response.status).json(data);
            return;
        }

        res.json(data);
    } catch (err) {
        console.error('Login proxy error:', err);
        res.status(500).json({ error: 'Internal server error while connecting to DB backend' });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const response = await fetch(`${FASTIFY_URL}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();

        if (!response.ok) {
            res.status(response.status).json(data);
            return;
        }

        res.status(201).json(data);
    } catch (err) {
        console.error('Registration proxy error:', err);
        res.status(500).json({ error: 'Internal server error while connecting to DB backend' });
    }
};
