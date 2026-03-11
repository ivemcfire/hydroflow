import { FastifyInstance } from 'fastify';

export default async function contextRoutes(fastify: FastifyInstance, options: any) {
    fastify.get('/', async (request: any, reply: any) => {
        try {
            return reply.send({
                sensors: [{ id: 1, type: "moisture", value: 34 }, { id: 2, type: "temperature", value: 24 }],
                flowLogs: [{ timestamp: new Date().toISOString(), rate: 5.2 }],
                alerts: [{ id: 101, message: "Low moisture in Zone B" }],
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            fastify.log.error(err, 'Failed to fetch context');
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
}
