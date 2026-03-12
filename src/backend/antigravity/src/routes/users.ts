import { FastifyInstance } from 'fastify';

export default async function usersRoutes(fastify: FastifyInstance, options: any) {

    // Register User
    fastify.post('/register', async (request: any, reply: any) => {
        const { username, password, role } = request.body;

        if (!username || !password) {
            return reply.status(400).send({ error: 'Username and password required' });
        }

        try {
            const result = await fastify.pg.query(
                'INSERT INTO Users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
                [username, password, role || 'view_only']
            );
            return reply.status(201).send(result.rows[0]);
        } catch (err: any) {
            fastify.log.error(err, 'Failed to register user');
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    // Login User
    fastify.post('/login', async (request: any, reply: any) => {
        const { username, password } = request.body;

        if (!username || !password) {
            return reply.status(400).send({ error: 'Username and password required' });
        }

        try {
            const result = await fastify.pg.query(
                'SELECT id, username, role FROM Users WHERE username = $1 AND password = $2',
                [username, password]
            );

            if (result.rows.length === 0) {
                return reply.status(401).send({ error: 'Invalid credentials' });
            }

            return reply.send(result.rows[0]);
        } catch (err) {
            fastify.log.error(err, 'Failed to login user');
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
}
