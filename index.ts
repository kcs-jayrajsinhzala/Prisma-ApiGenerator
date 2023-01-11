#!/usr/bin/env node
import inquirer from "inquirer"
import { dbConnect } from "./db";

inquirer
    .prompt([
        {
            type: 'list',
            name: 'dbDriver',
            message: 'Database Driver:',
            choices: ['mysql', 'postgresql', 'SQL server'],
        },
        {
            name: 'dbName',
            message: 'Database name:',
            default: 'test'
        },
        {
            name: 'dbPort',
            message: 'Database port:',
            default: '3306'
        },
        {
            name: 'dbUser',
            message: 'Database user:',
            default: 'root'
        },
        {
            name: 'dbPassword',
            message: 'Database password:',
            default: ''
        },
        {
            name: 'dbHost',
            message: 'Database Host:',
            default: 'localhost'
        },
        {
            type: "list",
            name: 'apiType',
            message: "what you want to use?",
            choices: ['RestAPI', 'GraphQL'],
        }

    ])
    .then(answers => {
        dbConnect(answers)
    });

