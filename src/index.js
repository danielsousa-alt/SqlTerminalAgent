import { createInterface } from "node:readline"
import { styleText } from "node:util"
import { generateSqlObject, generateTextAnswer } from "./ai.js"
import { createDb } from "./db.js"
import { DB_NAME } from "./constants.js"

const db = createDb(DB_NAME);
const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

function prompt(text) {
    return new Promise(resolve => rl.question(text, resolve))
}  

rl.on("close", () => {
    db.close();
    console.log(styleText("green", "Saindo do terminal SQL. Até logo!"))
    process.exit(0)
})

console.log(styleText("green", "Bem-vindo ao terminal SQL interativo!"))
while(true) {
    const question = await prompt(styleText(["blue", "bold"], "Digite sua pergunta (ou 'exit' para sair): "));

    if (!question.trim()) {
        continue;
    }

    if (question.trim().toLowerCase() === "exit") {
        rl.close();
        break;
    }

    try {
        const sqlObject = await generateSqlObject(question);
        const { sql, explanation } = sqlObject

        console.log(styleText("cyan", "SQL gerado:"))
        console.log(styleText("red", sql))
        console.log(styleText("cyan", "Explicação:"))
        console.log(styleText("yellow", explanation))

        const confirmation = await prompt(styleText(["blue", "bold"], "Deseja executar esta query? (s/n): "));
        if (confirmation.toLowerCase() === "s") {
            const result = db.prepare(sql).all().map(row => ({ ...row }));
            const answer = await generateTextAnswer({ question, sql, result });

            console.log(styleText("green", "Resultado da query:"))
            console.log(answer)
        } else {
            console.log(styleText("yellow", "Query não executada."))
        }
    } catch (error) {
        console.error(styleText("red", `Ocorreu um erro ao processar sua pergunta: ${error.message}`))
    }
}