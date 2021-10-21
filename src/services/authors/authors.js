import express from "express";
import uniqid from "uniqid";
import multer from "multer";
import { extname } from "path"
import {
  readAuthors,
  writeAuthors,
  authorsAvatarPic,
} from "../../lib/tools.js";

const authorsRouter = express.Router();

//Get all the authors
authorsRouter.get("/", async (req, res) => {
  //reading the whole body converting it from machine language to JSON
  const authors = await readAuthors();

  //Sending the whole body as a response
  res.status(200).send(authors);
});

//Get  the author with the matching Id
authorsRouter.get("/:authorsId", async (req, res) => {
  const authors = await readAuthors();

  //filtering the author that have that id
  const filteredAuthors = authors.find(
    (authors) => authors.id === req.params.authorsId
  );

  res.status(200).send(filteredAuthors);
});

//Create a unique author with an Id
authorsRouter.post("/", async (req, res) => {

  //spreading the whole body of the request sent by the client then adding an id and a date
  const createAuthor = {
    ...req.body,
    createdAt: new Date(),
    id: uniqid(),
    avatar: `https://ui-avatars.com/api/?name=${req.body.name}+${req.body.surname}`,
  };

  const authors = await readAuthors();

  if (authors.filter((author) => author.email === req.body.email).length > 0) {
    res.status(403).send({ succes: false, data: "User already exists" });
    return;
  }

  authors.push(createAuthor);

  //writing the changes on the disk
  await writeAuthors(authors);

  res.status(201).send({ id: authors.id });
});

authorsRouter.post("/:authorsId/uploadAvatar" , multer().single("avatar") , async (req, res, next) => {
    try {
      const extension = extname(req.file.originalname)
      await authorsAvatarPic(
        req.params.authorsId + extension,
        req.file.buffer
      );
      const authors = await readAuthors();
      const authorsUrl = authors.find(
        (blog) => blog.id === req.params.authorsId
      );
      const avatarUrl = `http://localhost:3001/img/authors/${req.params.authorsId}${extension}`
      authorsUrl.avatar = avatarUrl;
      const authorsArray = authors.filter(
        (blogs) => blogs.id !== req.params.authorsId
      );
      authorsArray.push(authorsUrl);
      await writeAuthors(authorsArray);
      res.send(200);
    } catch (error) {
      next(error);
    }
  }
);

/* authorsRouter.post("/checkEmail" , async (req ,res) => {

    const authors = await readAuthors()

    if(authors.filter(author => author.email === req.body.email).length > 0){
        res.status(403).send({succes: false , data: "User already exists"})
    } else {
        res.status(201).send({succes: true})
    }
}) */

//Modify a unique author that has the matching Id
authorsRouter.put("/:authorsId", async (req, res) => {
  //read all the authors
  const authors = readAuthors();
  //find the author
  const indexOfAuthor = authors.findIndex(
    (authors) => authors.id === req.params.authorsId
  );

  //spreading the old body content and replacing some parts or everything with the request sent by the client
  const updateAuthor = { ...authors[indexOfAuthor], ...req.body };

  authors[indexOfAuthor] = updateAuthor;

  //writing the changes on the disk
  await writeAuthors(authors);

  res.send(updateAuthor);
});

//Delete a unique author that has the matching Id
authorsRouter.delete("/:authorsId", async (req, res) => {
  //read the body content
  const authors = await readAuthors();

  const authorsArray = authors.filter(
    (authors) => authors.id !== req.params.authorsId
  );

  //writing on the disk all the authors but not the deleted one
  await writeAuthors(authorsArray);

  res.status(204).send();
});

export default authorsRouter;
