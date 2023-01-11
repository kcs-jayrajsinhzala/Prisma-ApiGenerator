export const resolverTemplate = (name, fields) => {
    const fileName = name.charAt(0).toUpperCase() + name.slice(1)

    let primaryType: string
    let primaryName: string
    for (let i in fields) {
        primaryName = i
        primaryType = fields[i]["type"]
        break;

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
            createTemplate += `\n\t@Mutation(() => ${fileName})
\tcreate(@Args('create${fileName}Input') create${fileName}Input: Create${fileName}Input) {
\treturn this.${name}Service.create(create${fileName}Input);
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
            updateTemplate += `\n\t@Mutation(() => ${fileName})
\tupdate(@Args('${primaryName}') ${primaryName}: ${primaryType}, @Args('update${fileName}Input') update${fileName}Input: Update${fileName}Input) {
\treturn this.${name}Service.update(${primaryName}, update${fileName}Input);
\t}\n\n`
        }
        else {
            updateTemplate = ""
        }
        return updateTemplate
    }


    let template = ``

    template += `import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ${fileName}Service } from './${name}.service';
import { Create${fileName}Input } from './dto/create-${name}.input';
import { Update${fileName}Input } from './dto/update-${name}.input';
import { Filter${fileName}Input } from './dto/filter-${name}.input';
import { ${fileName} } from './entities/${name}.entity';

@Resolver(${fileName})
export class ${fileName}Resolver {
    constructor(private readonly ${name}Service: ${fileName}Service) {}
${checkCreate(count)}
    @Query(() => [${fileName}])
    findAll(@Args('filter${fileName}Input') filter${fileName}Input: Filter${fileName}Input) {
    return this.${name}Service.findAll(filter${fileName}Input);
    }

    @Query(() => ${fileName})
    findOne(@Args('${primaryName}') ${primaryName}: ${primaryType}) {
    return this.${name}Service.findOne(${primaryName});
    }
${checkUpdate(count)}
    @Mutation(() => ${fileName})
    remove(@Args('${primaryName}') ${primaryName}: ${primaryType}) {
    return this.${name}Service.remove(${primaryName});
    }
}
`
    return template
}