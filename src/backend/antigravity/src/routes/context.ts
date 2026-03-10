import { FastifyInstance } from 'fastify';

export default async function contextRoutes(fastify: FastifyInstance, options: any) {
    fastify.get('/', async (request: any, reply: any) => {
        try {
            // Fetch latest sensors
            const sensorsResult = await fastify.pg.query('SELECT * FROM Sensors LIMIT 10');

            // Fetch latest flow logs
            const flowLogsResult = await fastify.pg.query('SELECT * FROM FlowLogs ORDER BY timestamp DESC LIMIT 20');

            // Fetch latest alerts
            const alertsResult = await fastify.pg.query('SELECT * FROM SystemAlerts ORDER BY timestamp DESC LIMIT 5');

            return reply.send({
                sensors: sensorsResult.rows,
                flowLogs: flowLogsResult.rows,
                alerts: alertsResult.rows,
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            fastify.log.error(err, 'Failed to fetch context');
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
}
