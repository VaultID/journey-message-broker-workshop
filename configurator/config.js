const amqplib = require('amqplib');

async function connect(uri) {
    let connection = await amqplib.connect(uri);
    let channel = await connection.createChannel();
    return {
        connection,
        channel
    }
}

async function createExchangeQueue(conn, exchangeName, queuesBindings) {
    await conn.channel.assertExchange(exchangeName, 'topic', {durable: true});
    for (const qName in queuesBindings) {
        const bindings = queuesBindings[qName];
        let queue = await conn.channel.assertQueue(qName, {durable: true});
        for (const binding of bindings) {
            await conn.channel.bindQueue(queue.queue, exchangeName, binding);
            console.log(`Fila "${queue.queue}" criada com binding "${binding}"`);
        }
    }
}

(async function() {
    let conn = await connect('amqp://admin:admin@localhost:5672');
    await createExchangeQueue(conn, 'ex-test', {
        'q1': ['#.q1.#', 'q-test'], //Recebe todas as msg direcionadas para q1 ou para q-test
        'q2': ['#.q2.#', 'q-test'], //Recebe todas as msg direcionadas para q2 ou para q-test
        'q3': ['#'], //Recebe todas as msg
    })
    return conn;
})().then(conn => {
    console.log("Configuração concluída.");
    conn.connection.close();
}).catch(err => {
    console.error(err);
})