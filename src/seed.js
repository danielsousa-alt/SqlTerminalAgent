import {createWriteStream, statSync} from "node:fs";
import {faker} from "@faker-js/faker";

const LOG_FILE = "access.log";
const LOG_INTERVAL = 10000;
const maxRecords = Number(process.argv[2]) || 10000;

if(
    (!Number.isInteger(maxRecords) && Number.isFinite(maxRecords)) 
    || Number.isNaN(maxRecords) 
    || maxRecords <= 0
) {
    console.error("Invalid number of records. Please provide a positive integer.");
    process.exit(1);
}

const stream = createWriteStream(LOG_FILE);

function generateUser() {
    return {
        ip: faker.internet.ipv4(),
        username: faker.internet.userName(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        location: faker.location.city(),
        job_area: faker.person.jobArea(),
        company: faker.company.name(),
        job_title: faker.person.jobTitle(),
        id: faker.string.uuid(),
    }
}

function generateLogEntry(user) {
    return {
        ...user,
        timestamp: faker.date.recent().toISOString(),
    }
}

function writerRecord(line) {
    return new Promise((resolve) => {
        if (!stream.write(line)) {
            stream.once("drain", resolve)
        } else {
            resolve();
        }
    });
}

console.log(`Gerando logs de acesso falsos em ${LOG_FILE}...`);
console.log(`Número máximo de registros: ${maxRecords.toLocaleString()}`);

const users = Array.from({length: 5}, generateUser);

function convertToGB(bytes) {
    return (bytes / 1024 / 1024 / 1024).toFixed(4);
}

process.on("SIGINT", () => {
    stream.end(() => {
        const { size } = statSync(LOG_FILE);
        console.log(`Registros gerados: ${count.toLocaleString()} | Tamanho do arquivo: ${convertToGB(size)} GB`);  
    })
});

let count = 0;

while (count < maxRecords) {
    const user = faker.helpers.arrayElement(users);
    const record = generateLogEntry(user);

    await writerRecord(JSON.stringify(record) + "\n");
    count++;

    if (count % LOG_INTERVAL === 0) {
        const { size } = statSync(LOG_FILE);
        console.log(`Registros gerados: ${count.toLocaleString()} | Tamanho do arquivo: ${convertToGB(size)} GB`);
    }
}