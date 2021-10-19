import express from "express";

import listEndpoints from "express-list-endpoints";

import authorsRouter from "./services/authors/authors.js";



const server = express()

server.use(express.json())  //parse every request to json

server.use("/authors" , authorsRouter) //setting the endpoint prefixes

const port = 3001  //server port

console.table(listEndpoints(server))  //all the endpoints printed out

server.listen( port , () => {   //server is listening that port
    console.log("server on:" , port)
})