
const {log, biglog, errorlog, colorize}=require('./out');
const model =require('./model');

/**
 * Muestra ayuda.
 *
 * @param rl Objeto readline usado para implementar el CLI
 */
exports.helpCmd= rl => {
    log("Comandos:");
    log("   h|help - Muestra esta ayuda.");
    log("   list - Listar los quizzes existentes.");
    log("   show <id> - Muestra la pregunta y la respuesta del quiz indicado.");
    log("   add - Muestra esta ayuda.");
    log("   delete <id> - Borrar el quiz indicado.");
    log("   edit <id> - Editar el quiz indicado.");
    log("   test <id> - Probar el quiz indicado.");
    log("   p|play - Jugar a preguntar aleatoriamnete todos los quizzes.");
    log("   credits - Créditos.");
    log("   q|quit - Salir del programa.");
    rl.prompt();
};
/**
 * Terminar el programa.
 *
 * @param rl Objeto readline usado para implementar el CLI
 */
exports.quitCmd=rl => {
    rl.close();
};
/**
 * Añade un nuevo quiz al módelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 *
 * Hay que recordar qeu el funcionamiento de la función rl.question es asíncrono
 * El prompt hay qur sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question
 *
 * @param rl Objeto readline usado para implementar el CLI
 */
exports.addCmd=rl => {
    rl.question(colorize(' Introduzca una pregunta: ','red'), question =>{
        rl.question(colorize(' Introduzca la respuesta: ','red'), answer => {
            model.add(question, answer);
            log(` ${colorize('Se ha añadido','magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
            rl.prompt();
        });
    });
};
/**
 * Lista todos los quizzes existentes en el modelo.
 *
 * @param rl Objeto readline usado para implementar el CLI
 */
exports.listCmd=rl => {

    model.getAll().forEach((quiz, id)=>{
        log(` [${colorize(id,'magenta')}]: ${quiz.question}`);  //${id} sustituye por el valor de id
    });
    rl.prompt();
};
/**
 * Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 * @param rl Objeto readline usado para implementar el CLI
 * @param id  Clave del quiz a mostrar.
 */
exports.showCmd=(rl,id) => { //MAAL

    if (typeof id === "undefined") {
        errorlog(`Falta parámetro id.`);
    }else{
        try{
            const quiz = model.getByIndex(id);
            log(` [${colorize(id,'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}` );
        } catch (error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};
/**
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
 *
 * @param rl Objeto readline usado para implementar el CLI
 * @param id  Clave del quiz probar.
 */
exports.testCmd=(rl,id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta parámetro id.`);
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);
            const pregunta = quiz.question;

            rl.question(` ${colorize(pregunta, 'red')}${colorize("?",'red')}`,respuesta => {
                resp=respuesta.toLowerCase().trim();
                if (resp === quiz.answer.toLowerCase().trim()){
                    log('Su respuesta es: ');
                    log ('Correcta');
                    biglog('CORRECTO', 'green');
                } else{
                    log('Su respuesta es: ');
                    log ('Incorrecta');
                    biglog('INCORRECTO', 'red');
                }
                rl.prompt();
            });
        } catch (error){
            errorlog(error.message);
            rl.prompt();
        }
    }
};
/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se contesta a todos satisfactoriamente
 *
 * @param rl Objeto readline usado para implementar el CLI
 */
exports.playCmd = rl => {
    let score = 0;
    let toBeResolved = []; //Array donde guardo los ids de todas las preguntas existentes
    let array1 = model.getAll();
    for (let i = 0; i < array1.length; i++){ //for que mete todos los ids existentes
        toBeResolved.push(i);
    }
    const playOne = () => {
        if (toBeResolved.length === 0) {
            log(`No hay nada más que preguntar.`);
            log(`Fin del examen. Aciertos:`);
            biglog(score, 'cyan');
            rl.prompt();
        } else {
            let id = Math.floor(Math.random() * toBeResolved.length);
            let quiz = array1[id];
            let pregunta = quiz.question;
            rl.question(` ${colorize(pregunta, 'red')}${colorize("?",'red')}`, respu => {
                let respuesta = respu.toLowerCase().trim();
                if (respuesta === quiz.answer.toLowerCase().trim()) {
                    score ++;
                    log(`CORRECTO - Lleva ${score} aciertos`);
                    toBeResolved.splice(id, 1);
                    array1.splice(id, 1);
                    playOne();
                } else {
                    log(`INCORRECTO.`);
                    log(`Fin del examen. Aciertos:`);
                    biglog(score, 'cyan');
                    rl.prompt();
                }
            })
        }
    };
    playOne();
};

/**
 * Edita un quiz del modelo.
 *
 * Hay que recordar qeu el funcionamiento de la función rl.question es asíncrono
 * El prompt hay qur sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question
 *
 * @param rl Objeto readline usado para implementar el CLI
 * @param id  Clave del quiz a editar en el modelo.
 */
exports.editCmd=(rl,id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta parámetro id.`);
    }else {
        try {
            const quiz = model.getByIndex(id);
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
                rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
                    model.update(id, question, answer);
                    log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>','magenta')} ${quiz.answer}`);
                    rl.prompt();
                });
            });
        } catch (error) {
            errorlog(error.message);
            rl.prompt();
        }
    }
};
/**
 * Borra un quiz del modelo.
 *
 * @param rl Objeto readline usado para implementar el CLI
 * @param id  Clave del quiz a borrar en el modelo.
 */
exports.deleteCmd=(rl,id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta parámetro id.`);
    }else{
        try{
            model.deleteByIndex(id);
        } catch (error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};
/**
 * Muestra los nombres de los autores de la práctica
 *
 * @param rl Objeto readline usado para implementar el CLI
 */
exports.creditsCmd=rl => {
    log('Autores de la práctica:');
    log('Virginia Blanco Rávena','green');
    log('Andrea Pérez Isla','green');
    rl.prompt();
};
