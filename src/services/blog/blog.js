import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { blogValidation } from "./validation.js";

const blogPostsRouter = express.Router();

//Main folder
const blogsPostJson = join(
  dirname(fileURLToPath(import.meta.url)),
  "blog.json"
);

blogPostsRouter.get("/", (req, res, next) => {
  try {
    //read
    const blogs = JSON.parse(fs.readFileSync(blogsPostJson));

    //send back the array
    res.status(200).send(blogs);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/:blogPostId", (req, res, next) => {
  try {
    //read
    const blogs = JSON.parse(fs.readFileSync(blogsPostJson));

    //check if there is a blogPostId
    const filterBlogs = blogs.filter(
      (blog) => blog._id === req.params.blogPostId
    );

    if (filterBlogs.length > 0) {
      //send back the filtered array
      res.status(200).send(filterBlogs);
    } else {
      next(
        createHttpError(404, `Blog with id ${req.params.blogPostId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.post("/", blogValidation , (req, res, next) => {
  try {
    const errorsList = validationResult(req);

    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    } else {
      //spread the req.body
      const createdPost = { _id: uniqid(), ...req.body, createdAt: new Date() };

      const blogs = JSON.parse(fs.readFileSync(blogsPostJson));

      blogs.push(createdPost);

      //write everything back to the json
      fs.writeFileSync(blogsPostJson, JSON.stringify(blogs));

      //send back the id of the newly created post
      res.status(201).send({ _id: blogs._id });
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.put("/:blogPostId", (req, res, next) => {
  try {
    const blogs = JSON.parse(fs.readFileSync(blogsPostJson));

    const index = blogs.findIndex((blog) => blog._id === req.params.blogPostId);

    const newBlogPost = { ...blogs[index], ...req.body };

    blogs[index] = newBlogPost;

    fs.writeFileSync(blogsPostJson, JSON.stringify(blogs));

    res.send(newBlogPost);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.delete("/:blogPostId", (req, res, next) => {
  try {
    const blogs = JSON.parse(fs.readFileSync(blogsPostJson));

    const blogsArray = blogs.filter(
      (blogs) => blogs._id !== req.params.blogPostId
    );

    fs.writeFileSync(blogsPostJson, JSON.stringify(blogsArray));

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default blogPostsRouter;