const amqplib = require('amqplib');
const args = require('args');

args.option('queue', 'Nome da fila a inicar o consumo');
args.option('prefetch', 'Tipo de prefetch [0|1]', 1);

const flags = args.parse(process.argv)

async function connect(uri) {
    let connection = await amqplib.connect(uri);
    let channel = await connection.createChannel();
    return {
        connection,
        channel
    }
}

(async function() {
    let queueName = flags.queue;
    let conn = await connect('amqp://admin:admin@localhost:5672');
    conn.channel.prefetch(flags.prefetch);
    let queue = await conn.channel.assertQueue(queueName, {durable: true});
    console.log(`Iniciando o consumo da fila "${queue.queue}" com prefetch ${flags.prefetch}.`);
    conn.channel.consume(queue.queue, (msg) => {
        console.log(`Mensagem recebida ${Date.now()}: ${msg.content.toString()}`);
        setTimeout(() => {
            conn.channel.ack(msg);
        }, Math.floor(Math.random() * 300 + 200)); // Random de 200 a 2000 ms
    });
    return conn;
})().then(conn => {
    console.log("Consumo iniciado...");
}).catch(err => {
    console.error(err);
})