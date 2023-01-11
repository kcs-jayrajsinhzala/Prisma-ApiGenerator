export const filterDtoTemplate = (name, apiType) => {
    const fileName = name.charAt(0).toUpperCase() + name.slice(1)
    let copyClassName = fileName
    if (fileName.split("-")[1] === "copy") {
        copyClassName = `${fileName.split("-")[0]}Copy`
    }

    let template = ``

    if (apiType === "RestAPI") {

        template += `import { ApiProperty } from "@nestjs/swagger"

export class Filter${copyClassName}Dto {
    @ApiProperty({ required: false, type: String })
    columnName?: string;

    @ApiProperty({ required: false, type: String })
    search?: string;

    @ApiProperty({ required: false, type: String })
    sortName?: string;

    @ApiProperty({ required: false, type: String })
    sortOrder?: string;

    @ApiProperty({ required: false, type: Number })
    limit?: number;

    @ApiProperty({ required: false, type: Number })
    page?: number;
}
    `
    }
    else if (apiType === "GraphQL") {
        template += `import { Field, InputType } from '@nestjs/graphql';\n
@InputType()
export class Filter${copyClassName}Input {
    @Field({ nullable: true })
    columnName?: string;

    @Field({ nullable: true })
    search?: string;

    @Field({ nullable: true })
    sortName?: string;

    @Field({ nullable: true })
    sortOrder?: string;

    @Field({ nullable: true })
    limit?: number;
    
    @Field({ nullable: true })
    page?: number;
}
    `
    }



    return template
}