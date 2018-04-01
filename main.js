const readline = require('readline');
const {log, biglog, errorlog, colorize} = require("./out");
const cmds = require("./cmds");
const net = require("net");


//socket servidor
//parámetro: función que queremos ejecutar cada vez que se conecte un cliente
//parámetro: socket -> nos conecta con el cliente
net.createServer(socket => {

    console.log("Se ha conectado un cliente desde " + socket.remoteAddress);
    //socket.remoteAddress -> dirección desde la que se ha conectado el cliente

    // Mensaje inicial
    biglog(socket, 'CORE Quiz', 'green');

    const rl = readline.createInterface({
        //input: process.stdin,     //salida estandar -> el quiz > sale donde npm start
        //output: process.stdout,   //salida estandar
        input: socket, //el quiz > sale donde se conecta el cliente
        output: socket,
        prompt: colorize("quiz > ", "blue"),
        completer: (line) => {
            const completions = 'h help add delete edit list test p play credits q quit'.split(' ');
            const hits = completions.filter((c) => c.startsWith(line));
            // show all completions if none found
            return [hits.lengh ? hits : completions, line];
        }
    });

    socket
        .on("end" , () => {rl.close();})
        .on("error" , () => {rl.close();});

    rl.prompt();
    rl
        .on('line',(line) => {
            let args = line.split(" ");
            let cmd = args[0].toLowerCase().trim();
            switch (cmd){
                case '':
                    rl.prompt();
                    break;
                case 'h':
                case 'help':
                    cmds.helpCmd(socket, rl);
                    break;
                case 'quit':
                case 'q':
                    cmds.quitCmd(socket, rl);
                    break;
                case 'add':
                    cmds.addCmd(socket, rl);
                    break;
                case 'list':
                    cmds.listCmd(socket, rl);
                    break;
                case 'show':
                    cmds.showCmd(socket, rl,args[1]);
                    break;
                case 'test':
                    cmds.testCmd(socket, rl,args[1]);
                    break;
                case 'play':
                case 'p':
                    cmds.playCmd(socket, rl);
                    break;
                case 'delete':
                    cmds.deleteCmd(socket, rl,args[1]);
                    break;
                case 'edit':
                    cmds.editCmd(socket, rl,args[1]);
                    break;
                case 'credits':
                    cmds.creditsCmd(socket, rl);
                    break;
                default:
                    log(socket, `Comando desconocido: '${colorize(cmd,'red')}' `);
                    log(socket, `Use ${colorize('help','green')} para ver todos los comandos disponibles.`);
                    rl.prompt();
                    break;
            }
        })
        .on('close',() =>{
            log(socket, 'Adios!');
            // process.exit(0); //matas el servidor
        });

})
//Para que escuche en el puerto 3030
.listen(3030);

