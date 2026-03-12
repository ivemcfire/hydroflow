import { FastifyInstance } from 'fastify';

export default async function contextRoutes(fastify: FastifyInstance, options: any) {
    fastify.get('/', async (request: any, reply: any) => {
        try {
            const [sensorsResult, flowLogsResult, alertsResult] = await Promise.all([
                fastify.pg.query('SELECT * FROM Sensors'),
                fastify.pg.query('SELECT * FROM FlowLogs'),
                fastify.pg.query('SELECT * FROM SystemAlerts'),
            ]);

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
