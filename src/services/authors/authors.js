import express from "express";
import fs from "fs"
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid"

const authorsRouter = express.Router()

//Main folder
const currentFolder = dirname(fileURLToPath(import.meta.url))


//Joined Main folder with json file
const authorsJsonPath = join(currentFolder , "authors.json")
console.log(authorsJsonPath)



//Get all the authors
authorsRouter.get("/" , (req ,res) => {
    

    //reading the whole body converting it from machine language to JSON
    const authors = JSON.parse(fs.readFileSync(authorsJsonPath))

    console.log(authors)
    
    //Sending the whole body as a response
    res.status(200).send(authors)
})



//Get  the author with the matching Id
authorsRouter.get("/:authorsId" , (req ,res) => {
    const authors = JSON.parse(fs.readFileSync(authorsJsonPath))

    //filtering the author that have that id
    const filteredAuthors = authors.find( authors => authors.id === req.params.authorsId)

    console.log(req.params.authorsId)

    res.status(200).send(filteredAuthors)
})


//Create a unique author with an Id
authorsRouter.post("/" , (req ,res) => {

    console.log(req.body)

    //spreading the whole body of the request sent by the client then adding an id and a date
    const createAuthor = { ...req.body , createdAt: new Date() , id: uniqid() , avatar: `https://ui-avatars.com/api/?name=${req.body.name}+${req.body.surname}`}

    const authors = JSON.parse(fs.readFileSync(authorsJsonPath))

    authors.push(createAuthor)

    //writing the changes on the disk
    fs.writeFileSync(authorsJsonPath , JSON.stringify(authors))

    res.status(201).send({id: authors.id})
})

//Modify a unique author that has the matching Id
authorsRouter.put("/:authorsId" , (req ,res) => {
    //read all the authors
    const authors = JSON.parse(fs.readFileSync(authorsJsonPath))

    //find the author
    const indexOfAuthor = authors.findIndex(authors => authors.id === req.params.authorsId)

    //spreading the old body content and replacing some parts or everything with the request sent by the client
    const updateAuthor = {...authors[indexOfAuthor] , ...req.body}

    authors[indexOfAuthor] = updateAuthor


    //writing the changes on the disk
    fs.writeFileSync(authorsJsonPath, JSON.stringify(authors))

    res.send(updateAuthor)
})


//Delete a unique author that has the matching Id
authorsRouter.delete("/:authorsId" , (req ,res) => {

    //read the body content
    const authors = JSON.parse(fs.readFileSync(authorsJsonPath))

    const authorsArray = authors.filter(authors => authors.id !== req.params.authorsId)

    //writing on the disk all the authors but not the deleted one
    fs.writeFileSync(authorsJsonPath, JSON.stringify(authorsArray))

    res.status(204).send()
})


export default authorsRouter