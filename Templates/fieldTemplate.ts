
const generateColumnTemplate = (filename, value, currentcolumn) => {
    let template = ``
    // template += `\t@Column({ allowNull: ${value['allowNull']},`

    // if (value['key'] === 'PRI') {
    //     template += ` primaryKey: true, autoIncrement: true,`
    // }
    // if (value['enumFields']) {
    //     template += ` type: sequelize.ENUM${value['enumFields'].slice(4)},`
    // }
    // if (value['default']) {
    //     if (value['default'] === true || value['default'] === false || value['default'] === 'new Date()') {
    //         template += ` defaultValue: ${value['default']},`
    //     }
    //     else {
    //         template += ` defaultValue: '${value['default']}',`
    //     }
    // }
    // template += ` })\n`
    if (value['kind'] === "enum") {
        if (!value['allowNull']) {
            template += `\t@Field(() => ${value['type'].charAt(0).toUpperCase() + value['type'].slice(1)}, { nullable: true })\n`
        } else {
            template += `\t@Field(() => ${value['type'].charAt(0).toUpperCase() + value['type'].slice(1)})\n`
        }
        template += `\t${currentcolumn}: ${filename}_${currentcolumn}\n\n`
    }
    else {
        if (!value['allowNull']) {
            template += `\t@Field({ nullable: true})\n`
        } else {
            template += `\t@Field()\n`
        }
        template += `\t${currentcolumn}: ${value['type']}\n\n`
    }
    return template
}

// const generateBelongsToTemplate = (value, currentcolumn, type) => {
//     let template = ``

//     template += `\t@BelongsTo(() => ${value['reference'].charAt(0).toUpperCase() + value['reference'].slice(1)}, {
// \t\tforeignKey: '${currentcolumn}',
// \t\ttargetKey: '${value['referenceColumn']}',
// \t\tonDelete: 'CASCADE',
// \t\tonUpdate: 'CASCADE',
// \t})\n`
//     if (type === "GraphQL") {
//         template += `\t@Field(() => ${value['reference'].charAt(0).toUpperCase() + value['reference'].slice(1)}, { nullable: true })\n`
//     }
//     template += `\t${value['referenceAs']}?: ${value['reference'].charAt(0).toUpperCase() + value['reference'].slice(1)} | null;\n\n`

//     return template
// }

export const fieldTemplate = (filename, field) => {
    let template = ``

    for (let i in field) {
        if (field[i]['reference']) {
            template += `\t@ForeignKey(() => ${field[i]['reference'].charAt(0).toUpperCase() + field[i]['reference'].slice(1)})\n`
            template += generateColumnTemplate(filename, field[i], i)

            // template += generateBelongsToTemplate(field[i], i, apiType)
        }
        else {
            template += generateColumnTemplate(filename, field[i], i)
        }
    }
    return template
}