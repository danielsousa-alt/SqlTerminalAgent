import { describe, it } from "node:test";
import { equal } from "node:assert";
import { createDb } from "./db.js";
import { generateUser, generateLogEntry } from "./mocks.js";

describe("Teste para o camada de banco de dados", () => {
    const db = createDb("test.db");
    
    it("Deve criar uma tabela de logs de acesso", () => {
        const user = generateUser();
        const record = generateLogEntry(user);
        
        db.prepare(`
            INSERT INTO access_logs (
                id, 
                ip, 
                username, 
                first_name, 
                last_name, 
                email, 
                location, 
                job_area, 
                company, 
                job_title, 
                timestamp
            ) VALUES (
                ?, 
                ?, 
                ?, 
                ?, 
                ?, 
                ?, 
                ?, 
                ?, 
                ?, 
                ?, 
                ?
            )
        `)
        .run (
            record.id, 
            record.ip, 
            record.username, 
            record.first_name, 
            record.last_name, 
            record.email, 
            record.location, 
            record.job_area, 
            record.company, 
            record.job_title, 
            record.timestamp,
        )
        
        const all = db.prepare("SELECT COUNT(*) as count FROM access_logs").all();
        equal(all[0].count, 1, "Deve ter inserido um registro na tabela de logs de acesso");
    })
})