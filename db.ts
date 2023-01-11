import fs from "fs"
import { exec, execSync } from "child_process"
import { moduleTemplate } from './Templates/moduleTemplate'
import { controllerTemplate } from './Templates/controllerTemplate'
import { serviceTemplate } from './Templates/serviceTemplate'
import { createDtoTemplate } from './Templates/createDtoTemplate'
import { updateDtoTemplate } from './Templates/updateDtoTemplate'
import { filterDtoTemplate } from './Templates/filterDtoTemplate'
import { appModuleTemplate } from './Templates/appModuleTemplate'
import { envTemplate } from './Templates/envTemplate'
import { mainTemplate } from './Templates/maintemplate'
import { prismaTemplate } from "./Templates/prismaTemplate"
import { resolverTemplate } from "./Templates/resolverTemplate"
import { entityTemplate } from "./Templates/entityTemplate"

interface DatabaseInfo {
    dbName: string,
    dbPort: string,
    dbUser: string,
    dbPassword: string,
    dbHost: string,
    dbDriver: string,
    apiType: string
}

export const dbConnect = async (dbInfo: DatabaseInfo) => {

    const createAllFiles = (name, fields) => {

        let isUnique: boolean = true

        for (let i in fields) {
            if (fields[i]["default"]?.name === "autoincrement" && fields[i]["unique"] && fields[i]["allowNull"] || fields[i]["default"]?.name === "autoincrement" && fields[i]["allowNull"] || fields[i]["unique"] && fields[i]["allowNull"] || fields[i]["allowNull"] || fields[i]["unique"]) {
                isUnique = true
                break;
            }
            else {
                isUnique = false
                break;
            }

        }

        if (isUnique) {
            const createDtoResponse = createDtoTemplate(name, fields, dbInfo.apiType)
            const moduleResponse = moduleTemplate(name, fields, dbInfo.apiType)
            const controllerResponse = controllerTemplate(name, fields)
            const serviceResponse = serviceTemplate(name, fields, dbInfo.apiType)
            const updateDtoResponse = updateDtoTemplate(name, fields, dbInfo.apiType)
            const filterDtoResponse = filterDtoTemplate(name, dbInfo.apiType)
            const resolverResponse = resolverTemplate(name, fields)

            if (dbInfo.apiType === "RestAPI") {

                fs.mkdirSync(`./src/${name}`, { recursive: true })
                fs.mkdirSync(`./src/${name}/dto`, { recursive: true })
                fs.writeFileSync(`./src/${name}/dto/create-${name}.dto.ts`, createDtoResponse)
                fs.writeFileSync(`./src/${name}/dto/update-${name}.dto.ts`, updateDtoResponse)
                fs.writeFileSync(`./src/${name}/dto/filter-${name}.dto.ts`, filterDtoResponse)
                fs.writeFileSync(`./src/${name}/${name}.module.ts`, moduleResponse)
                fs.writeFileSync(`./src/${name}/${name}.controller.ts`, controllerResponse)
                fs.writeFileSync(`./src/${name}/${name}.service.ts`, serviceResponse)
            }
            else if (dbInfo.apiType === "GraphQL") {
                const entityResponse = entityTemplate(name, fields)
                fs.mkdirSync(`./src/${name}`, { recursive: true })
                fs.mkdirSync(`./src/${name}/entities`, { recursive: true })
                fs.writeFileSync(`./src/${name}/entities/${name}.entity.ts`, entityResponse)
                fs.mkdirSync(`./src/${name}/dto`, { recursive: true })
                fs.writeFileSync(`./src/${name}/dto/create-${name}.input.ts`, createDtoResponse)
                fs.writeFileSync(`./src/${name}/dto/update-${name}.input.ts`, updateDtoResponse)
                fs.writeFileSync(`./src/${name}/dto/filter-${name}.input.ts`, filterDtoResponse)
                fs.writeFileSync(`./src/${name}/${name}.module.ts`, moduleResponse)
                fs.writeFileSync(`./src/${name}/${name}.resolver.ts`, resolverResponse)
                fs.writeFileSync(`./src/${name}/${name}.service.ts`, serviceResponse)
            }
        }
    }

    const generate = (isDiffrence: boolean, diffData?, actualData?) => {
        const Prisma = require("@prisma/client")
        // @ts-ignore
        const data = Prisma.dmmf.datamodel.models

        const modelNames = Prisma.ModelName
        let dataObj = {}
        for (let i in modelNames) {
            if (actualData) {
                for (let a of actualData) {
                    if (a.includes(`${i} {`)) {
                        dataObj[i] = a
                    }
                }
            }
        }
        let diffmodelList = []
        for (let i in dataObj) {
            for (let a of diffData) {
                if (dataObj[i].includes(a)) {
                    diffmodelList.push(i)
                }
            }
        }

        const checkTypes = (value) => {

            if (value.includes("Int") || value.includes("Float") || value.includes("Decimal")) {
                return 'number'
            }
            else if (value.includes("Date") || value.includes("Time")) {
                return 'Date'
            }
            else if (value.includes("Boolean") || value.includes("tinyInt")) {
                return 'boolean'
            }
            else if (value.includes('varchar') || value.includes('text') || value.includes('String')) {
                return 'string'
            }
            else {
                return value
            }
        }

        let models = {}

        for (let i in data) {
            const fields = {}

            data[i]["fields"].forEach(d => {
                if (d["kind"] !== "object") {

                    d["type"] = checkTypes(d["type"])
                    if (d["kind"] === "enum") {
                        d["type"] = "string"
                    }
                    fields[d["name"]] = {
                        type: d["type"],
                        kind: d["kind"],
                        default: d["default"],
                        allowNull: d["isRequired"],
                    }
                }
            })

            let name = data[i]["name"]

            if (isDiffrence) {
                console.log("name", name);
                for (let i of diffmodelList) {
                    console.log("i", i);
                    if (name === i) {
                        console.log("diff", name);

                        models[name] = `${name.charAt(0).toUpperCase() + name.slice(1)}`
                        createAllFiles(name, fields)
                    }
                }
                if (!fs.existsSync(`./src/${name}`)) {
                    models[name] = `${name.charAt(0).toUpperCase() + name.slice(1)}`
                    createAllFiles(name, fields)
                }

            }
            else {
                if (!fs.existsSync(`./src/${name}`)) {
                    models[name] = `${name.charAt(0).toUpperCase() + name.slice(1)}`
                    createAllFiles(name, fields)
                }
            }

        }

        const envResponse = envTemplate(dbInfo)
        fs.writeFileSync(`./.env`, envResponse)

        const appModuleResponse = appModuleTemplate(models)
        fs.writeFileSync(`./src/app.module.ts`, appModuleResponse)

        if (dbInfo.apiType === "RestAPI") {
            const mainResponse = mainTemplate()
            fs.writeFileSync(`./src/main.ts`, mainResponse)
        }

    }

    if (!fs.existsSync('./prisma/schema.prisma')) {
        execSync("npx prisma init")
        const prismaResponse = prismaTemplate(dbInfo)
        fs.writeFileSync(`./prisma/schema.prisma`, prismaResponse)
        console.log("after init");

        execSync("npx prisma db pull")
        console.log("after db pull");

        execSync("npx prisma generate")
        console.log("after generate");

        if (fs.existsSync('schema.back.prisma')) {
            exec("fc schema.back.prisma ./prisma/schema.prisma", (err, stdout, stderr) => {
                const value = stdout.split(`*****\r\n\r\n*****`)
                const diffData = []
                for (let i in value) {
                    diffData.push(value[i].split(`***** ./PRISMA/SCHEMA.PRISMA\r\n`)[1]?.split("*****")[0])
                }
                let actualData = []
                fs.readFile("./prisma/schema.prisma", "utf8", (err, data) => {
                    actualData = data.split("enum")[0].split("model")
                    actualData.shift()
                    const newDiffData = []
                    for (let i of diffData) {
                        const replacedData = i.replaceAll("\r\n", "\n")
                        newDiffData.push(replacedData.replaceAll("model ", ""))
                    }
                    const isDiff = diffData ? true : false
                    generate(isDiff, newDiffData, actualData)
                    fs.copyFile('./prisma/schema.prisma', 'schema.back.prisma', () => { })
                })
            })
        }
        else {
            generate(false)
            fs.copyFile('./prisma/schema.prisma', 'schema.back.prisma', () => { })
        }

    }
    else {
        const prismaResponse = prismaTemplate(dbInfo)
        fs.writeFileSync(`./prisma/schema.prisma`, prismaResponse)

        execSync("npx prisma db pull")
        console.log("after db pull");

        execSync("npx prisma generate")
        console.log("after generate");

        if (fs.existsSync('schema.back.prisma')) {
            exec("fc schema.back.prisma ./prisma/schema.prisma", (err, stdout, stderr) => {
                const value = stdout.split(`*****\r\n\r\n*****`)
                const diffData = []
                for (let i in value) {
                    diffData.push(value[i].split(`***** ./PRISMA/SCHEMA.PRISMA\r\n`)[1]?.split("*****")[0])
                }
                let actualData = []
                fs.readFile("./prisma/schema.prisma", "utf8", (err, data) => {
                    actualData = data.split("enum")[0].split("model")
                    actualData.shift()
                    const newDiffData = []
                    for (let i of diffData) {
                        const replacedData = i.replaceAll("\r\n", "\n")
                        newDiffData.push(replacedData.replaceAll("model ", ""))
                    }
                    const isDiff = diffData ? true : false
                    generate(isDiff, newDiffData, actualData)
                    fs.copyFile('./prisma/schema.prisma', 'schema.back.prisma', () => { })
                })
            })
        }
        else {
            generate(false)
            fs.copyFile('./prisma/schema.prisma', 'schema.back.prisma', () => { })
        }

    }
    if (!fs.existsSync('./src')) {
        fs.mkdirSync('./src', { recursive: true });
    }
}