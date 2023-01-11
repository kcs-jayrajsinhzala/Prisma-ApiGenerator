import { fieldTemplate } from "./fieldTemplate"

export const entityTemplate = (filename, fields) => {

    const importTemplates = (value) => {
        let template = ``

        for (let i in value) {
            if (value[i]['kind'] === "enum") {
                template += `import { ${filename}_${i} } from '@prisma/client';\n`
            }
        }
        return template
    }
    let template = ``

    const fieldsData = fieldTemplate(filename, fields)

    template += `import { Field, ObjectType } from '@nestjs/graphql';
${importTemplates(fields)}
@ObjectType({ isAbstract: true })
export class ${filename.charAt(0).toUpperCase() + filename.slice(1)}{
${fieldsData}}
        `

    return template

}