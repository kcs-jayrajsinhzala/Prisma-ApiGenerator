export const moduleTemplate = (name, fields, apiType) => {
    const fileName = name.charAt(0).toUpperCase() + name.slice(1)
    let copyClassName = fileName
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

    const modelList = []
    reference.forEach(element => {
        modelList.push(element.charAt(0).toUpperCase() + element.slice(1))
    })



    const importTemplates = (value, type, fname) => {
        let template = ``
        if (type === "GraphQL") {
            template += `import { GraphQLModule } from '@nestjs/graphql';\nimport { ${fname}Resolver }  from './${fname}.resolver';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';`
        }
        else if (type === "RestAPI") {
            template += `import { ${fname}Controller }  from './${fname}.controller';\n`
        }

        return template
    }

    const providersTemplate = (fname, type) => {
        let template = ``
        if (type === "RestAPI") {
            template += `\tcontrollers: [${fname}Controller],\n\tproviders: [${fname}Service],`
        }
        else if (type === "GraphQL") {
            template += `\tproviders: [${fname}Resolver, ${fname}Service],`
        }
        return template
    }

    const checkGraphQlModule = (fname, type) => {
        let template = ``
        if (type === "GraphQL") {
            template += `\n\t\tGraphQLModule.forRoot<ApolloDriverConfig>({
        driver: ApolloDriver,
        autoSchemaFile: true,
        include: [${copyClassName}Module],
        path: '${name}/graphql',
        context: ({ req, res }) =>
            ({ req, res })  
        }),`
        }
        return template
    }

    let template = ``

    template += `import { Module } from '@nestjs/common';
import { ${copyClassName}Service }  from './${name}.service';
${importTemplates(reference, apiType, copyClassName)}
@Module({
    imports:[${checkGraphQlModule(fileName, apiType)}],
${providersTemplate(copyClassName, apiType)}
})
export class ${copyClassName}Module {
}
`

    return template
}