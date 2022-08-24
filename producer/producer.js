const amqplib = require('amqplib');
const args = require('args');

args.option('topic', 'Nome do tópico a receber a mensagem');
args.option('route', 'Chave de rota para envio da mensagem');
args.option('amount', 'Quantidade de mensagens', 1);

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
    let conn = await connect('amqp://admin:admin@localhost:5672');
    console.log(`Iniciando a produção de "${flags.amount}" mensgens.`);
    for (let i = 0; i < flags.amount; i++) {
        let msg = `Mensagem ${i+1}.`;
        console.log(`Msg [${msg}] sendo enviada...`);
        conn.channel.publish(flags.topic, flags.route, Buffer.from(msg), {
            persistent: true,
            timestamp: Date.now()
        });
    }
    
    return conn;
})().then(conn => {
    console.log("Produção concluída...");
    setTimeout(() => {
        conn.connection.close()
    }, 500);
}).catch(err => {
    console.error(err);
})