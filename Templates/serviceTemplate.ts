export const serviceTemplate = (name, fields, apiType) => {
    const fileName = name.charAt(0).toUpperCase() + name.slice(1)
    let copyClassName = fileName

    name = name.charAt(0).toLowerCase() + name.slice(1)

    let primaryType: string
    let primaryName: string
    for (let i in fields) {
        primaryName = i
        primaryType = fields[i]["type"]
        break;

    }

    if (fileName.split("-")[1] === "copy") {
        copyClassName = `${fileName.split("-")[0]}Copy`
    }

    let reference = []
    for (let i in fields) {
        if (fields[i]['reference']) {
            reference.push(fields[i]['reference'])
        }
    }
    reference = [... new Set(reference)]
    const importTemplates = (value, type) => {
        let template = ``
        if (type === "GraphQL") {
            template += `import { Create${copyClassName}Input } from './dto/create-${name}.input';
import { Update${copyClassName}Input } from './dto/update-${name}.input';
import { Filter${copyClassName}Input } from './dto/filter-${name}.input';\n`
        }
        else if (type === "RestAPI") {
            template += `import { Create${copyClassName}Dto } from './dto/create-${name}.dto';
import { Update${copyClassName}Dto } from './dto/update-${name}.dto';
import { Filter${copyClassName}Dto } from './dto/filter-${name}.dto';\n`
        }

        return template
    }

    const includeModelTemplates = (element) => {
        let template = ``
        for (let i in element) {
            if (element[i]['reference'] && element[i]['referenceAs']) {
                // template = `include: [`
                template += `{ model: ${element[i]['reference'].charAt(0).toUpperCase() + element[i]['reference'].slice(1)}, as: '${element[i]['referenceAs']}' },`
            }
        }
        return template
    }

    const checkIncludesTemplate = (value) => {
        let template = ``
        for (let i in value) {
            if (value[i]['reference'] && value[i]['referenceAs']) {
                template = `include: [`
            }
        }
        if (template !== '') {
            template += `${includeModelTemplates(value)}]`
        }

        return template

    }
    const data = checkIncludesTemplate(fields)

    let count = 0
    for (let i in fields) {
        if (fields[i]["allowNull"] && fields[i]["default"]?.name !== "autoincrement") {
            count += 1
        }

    }

    const checkCreate = (requireCount) => {
        let createTemplate = ``
        if (requireCount > 0) {
            createTemplate += `\n\tasync create(create${copyClassName}${checkGraphQL}: Create${copyClassName}${checkGraphQL}) {
        try {
            const ${name}Details = await prisma.${name}.create({
                data:{ ...create${copyClassName}${checkGraphQL} }
            });
            if(!${name}Details){
                throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
            }
        
            return ${name}Details;
        } catch (err) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
            }
        }  
`
        }
        else {
            createTemplate = ""
        }
        return createTemplate
    }
    const checkUpdate = (requireCount) => {
        let updateTemplate = ``
        if (requireCount > 0) {
            updateTemplate += `\n\tasync update(${primaryName}: ${primaryType}, update${copyClassName}${checkGraphQL}: Update${copyClassName}${checkGraphQL}) {
        try{
            const updated${copyClassName} = await prisma.${name}.update({ 
                where: { ${primaryName}: ${primaryType === "number" ? "+" : ""}${primaryName} },
                data: { ...update${copyClassName}${checkGraphQL} },
            }) 

            return updated${copyClassName};
        }
        catch (err){
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
    }
`
        }
        else {
            updateTemplate = ""
        }
        return updateTemplate
    }

    const checkGraphQL = apiType === "GraphQL" ? "Input" : apiType === "RestAPI" ? "Dto" : ""

    let template = ``

    const backup = `    limit:+filter${copyClassName}${checkGraphQL}.limit,
    offset,
    where: whereCondition,
    ${data ? `${data},` : ''}
    order:order`

    template += `import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
${importTemplates(reference, apiType)}

const prisma = new PrismaClient();

@Injectable()
export class ${copyClassName}Service {
${checkCreate(count)}
    async findAll(filter${copyClassName}${checkGraphQL}: Filter${copyClassName}${checkGraphQL}) {
        try{
            const limit = filter${copyClassName}${checkGraphQL}.limit ? filter${copyClassName}${checkGraphQL}.limit :  10
            const page = filter${copyClassName}${checkGraphQL}.page ? filter${copyClassName}${checkGraphQL}.page :   1
      
            const offset = (page - 1) * limit;
    
            let order = {}
      
            if(filter${copyClassName}${checkGraphQL}.sortName && filter${copyClassName}${checkGraphQL}.sortOrder){
              order[filter${copyClassName}${checkGraphQL}.sortName] = filter${copyClassName}${checkGraphQL}.sortOrder
            }

            const whereclause = {}
            if (filter${copyClassName}${checkGraphQL}.columnName && filter${copyClassName}${checkGraphQL}.search) {

                whereclause[filter${copyClassName}${checkGraphQL}.columnName] = { contains: filter${copyClassName}${checkGraphQL}.search }
            }
      
            const ${name} = await prisma.${name}.findMany({
                where: whereclause,
                skip: offset,
                take: +limit,
                orderBy: order
            });
            return ${name}
        }
        catch (err){
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
    }

    async findOne(${primaryName}: ${primaryType}) {
        try {
            const ${name} = await prisma.${name}.findUnique({
              where: {
                ${primaryName}: ${primaryType === "number" ? "+" : ""}${primaryName},
              },
            });
            return ${name}
      
          } catch (err) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
          }
    }
${checkUpdate(count)}
    async remove(${primaryName}: ${primaryType}) {
        try{
            return await prisma.${name}.delete({ where: { ${primaryName}: ${primaryName} } });
        }
        catch (err){
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
    }
}
`
    return template
}