export const updateDtoTemplate = (name, fields, apiType) => {
  const fileName = name.charAt(0).toUpperCase() + name.slice(1)
  let copyClassName = fileName
  if (fileName.split("-")[1] === "copy") {
    copyClassName = `${fileName.split("-")[0]}Copy`
  }

  let count = 0
  for (let i in fields) {
    if (fields[i]["allowNull"] && fields[i]["default"]?.name !== "autoincrement") {
      count += 1
    }

  }

  let primaryType: string
  let primaryName: string
  for (let i in fields) {
    primaryName = i
    primaryType = fields[i]["type"]
    break;

  }

  const fieldsTemplate = (element, type) => {
    let fieldTemplate = ``
    for (let i in element) {
      if (element[i]['key'] !== 'PRI') {
        if (type === "GraphQL") {
          fieldTemplate += `\t@Field()\n`
        }
        else if (type === "RestAPI") {
          fieldTemplate += `@ApiProperty({ required: false, type: ${element[i]['type'].charAt(0).toUpperCase() + element[i]['type'].slice(1)} })`
        }
        fieldTemplate += `\t${i}: ${element[i]['type']}\n`
      }
    }
    return fieldTemplate
  }

  const data = fieldsTemplate(fields, apiType)
  const checkReuiredFields = (requireCount) => {
    let requireTemplate = ``
    if (requireCount > 0) {
      requireTemplate += `import { Field, InputType } from '@nestjs/graphql';
  
@InputType()
`
    }
    else {
      requireTemplate = ""
    }
    return requireTemplate
  }
  const checkForFields = (requireCount) => {
    let requireTemplate = ``
    if (requireCount > 0) {
      requireTemplate += `\t@Field()
\t${primaryName}: ${primaryType}
`
    }
    else {
      requireTemplate = ""
    }
    return requireTemplate
  }

  let template = ``

  if (apiType === "RestAPI") {
    template += `import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from "@nestjs/swagger";
import { Create${copyClassName}Dto } from './create-${name}.dto';
  
export class Update${copyClassName}Dto extends PartialType(Create${copyClassName}Dto) {\n`

  }
  else if (apiType === "GraphQL") {
    template += `import { PartialType } from '@nestjs/mapped-types';
import { Create${copyClassName}Input } from './create-${name}.input';
${checkReuiredFields(count)}
export class Update${copyClassName}Input extends PartialType(Create${copyClassName}Input) {
${checkForFields(count)}
`
  }
  template += `}`


  return template
}