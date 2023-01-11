export const controllerTemplate = (name, fields) => {
    const fileName = name.charAt(0).toUpperCase() + name.slice(1)
    let copyClassName = fileName

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
    let count = 0
    for (let i in fields) {
        if (fields[i]["allowNull"] && fields[i]["default"]?.name !== "autoincrement") {
            count += 1
        }

    }

    const checkCreate = (requireCount) => {
        let createTemplate = ``
        if (requireCount > 0) {
            createTemplate += `\n\t@Post('create')
\tcreate(@Body() create${copyClassName}Dto: Create${copyClassName}Dto) {
\treturn this.${name}Service.create(create${copyClassName}Dto);
\t}\n\n`
        }
        else {
            createTemplate = ""
        }
        return createTemplate
    }
    const checkUpdate = (requireCount) => {
        let updateTemplate = ``
        if (requireCount > 0) {
            updateTemplate += `\n\t@Patch(':${primaryName}')
\tupdate(@Param('${primaryName}') ${primaryName}: ${primaryType}, @Body() update${copyClassName}Dto: Update${copyClassName}Dto) {
\treturn this.${name}Service.update(${primaryName}, update${copyClassName}Dto);
\t}\n\n`
        }
        else {
            updateTemplate = ""
        }
        return updateTemplate
    }



    let template = ``

    template += `import { Controller, Get, Query, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ${copyClassName}Service } from './${name}.service';
import { Create${copyClassName}Dto } from './dto/create-${name}.dto';
import { Filter${copyClassName}Dto } from './dto/filter-${name}.dto';
import { Update${copyClassName}Dto } from './dto/update-${name}.dto';

@Controller('${name}')
export class ${copyClassName}Controller {
    constructor(private readonly ${name}Service: ${copyClassName}Service) {}
    ${checkCreate(count)}
    @Get('all')
    findAll(@Query() filter${copyClassName}Dto: Filter${copyClassName}Dto) {
    return this.${name}Service.findAll(filter${copyClassName}Dto);
    }

    @Get(':${primaryName}')
    findOne(@Param('${primaryName}') ${primaryName}: ${primaryType}) {
    return this.${name}Service.findOne(${primaryName});
    }
    ${checkUpdate(count)}
    @Delete(':${primaryName}')
    remove(@Param('${primaryName}') ${primaryName}: ${primaryType}) {
    return this.${name}Service.remove(${primaryName});
    }
}
`
    return template
}