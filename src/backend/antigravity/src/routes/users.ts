import { FastifyInstance } from 'fastify';

export default async function usersRoutes(fastify: FastifyInstance, options: any) {

    // Register User
    fastify.post('/register', async (request: any, reply: any) => {
        const { username, password, role } = request.body;

        if (!username || !password) {
            return reply.status(400).send({ error: 'Username and password required' });
        }

        try {
            // Mock DB insert
            return reply.status(201).send({ id: 1, username, role: role || 'view_only' });
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
            // Mock user login
            if (username === 'admin' && password === 'admin') {
                return reply.send({ id: 1, username: 'admin', role: 'admin' });
            } else if (password !== '') {
                return reply.send({ id: 2, username, role: 'view_only' });
            }

            return reply.status(401).send({ error: 'Invalid credentials' });
        } catch (err) {
            fastify.log.error(err, 'Failed to login user');
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
}
