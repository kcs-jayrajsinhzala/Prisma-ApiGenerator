export const prismaTemplate = (dbInfo) => {
    let template = ``

    const driverName = dbInfo.dbDriver === "mysql" ? "mysql" : dbInfo.dbDriver === "postgresql" ? "postgresql" : dbInfo.dbDriver === "SQL server" ? "sqlserver" : ""

    if (dbInfo.dbPassword.includes("@")) {
        dbInfo.dbPassword = dbInfo.dbPassword.replace("@", "%40")
    }

    if (driverName === "mysql") {

        template += `generator client {
    provider = "prisma-client-js"
    previewFeatures = ["fullTextSearch", "fullTextIndex"]
}

datasource db {
    provider = "${driverName}"
    url      = "${driverName}://${dbInfo.dbUser}:${dbInfo.dbPassword}@${dbInfo.dbHost}/${dbInfo.dbName}"
}`
    }
    else if (driverName === "sqlserver") {
        dbInfo.dbHost.replace(`"\"`, `\\`)
        template += `generator client {
    provider = "prisma-client-js"
    previewFeatures = ["fullTextSearch", "fullTextIndex"]
}
        
datasource db {
    provider = "${driverName}"
    url      = "${driverName}://${dbInfo.dbHost};initialCatalog=sample;database=${dbInfo.dbName};user=${dbInfo.dbUser};password=${dbInfo.dbPassword};trustServerCertificate=true;"
}`
    }
    else if (driverName === "postgresql") {
        template += `generator client {
    provider = "prisma-client-js"
    previewFeatures = ["fullTextSearch", "fullTextIndex"]
}

datasource db {
    provider = "${driverName}"
    url      = "${driverName}://${dbInfo.dbUser}:${dbInfo.dbPassword}@${dbInfo.dbHost}/${dbInfo.dbName}"
}`
    }
    console.log(template);


    return template
}