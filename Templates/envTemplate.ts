export const envTemplate = (dbInfo) => {
    let template = ``


    template += `DB_HOST_NAME=${dbInfo.dbHost}
DB_PORT=${dbInfo.dbPort}
DB_USERNAME=${dbInfo.dbUser}
DB_PASSWORD=${dbInfo.dbPassword}
DB_NAME=${dbInfo.dbName}
NODE_ENV=development
`

    return template
}