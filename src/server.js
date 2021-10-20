import express from "express";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./services/authors/authors.js";
import blogPostsRouter from "./services/blog/blog.js"
import cors from "cors"
import { badRequest , unauthorizedHandler , notFoundHandler , defaultError } from "./errorHandlers.js"


const server = express()

//FIRST TWO MIDDLEWARES
server.use(cors())
server.use(express.json())  //parse every request to json


//ENDPOINTS
server.use("/authors" , authorsRouter) //setting the endpoint prefixes
server.use("/blogPosts" , blogPostsRouter) //setting the endpoint prefixes

//ERROR HANDLERS

server.use(badRequest)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(defaultError)


const port = 3001  //server port

console.table(listEndpoints(server))  //all the endpoints printed out

server.listen( port , () => {}) //server is listening that port