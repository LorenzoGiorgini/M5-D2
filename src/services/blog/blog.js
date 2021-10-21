import express from "express";
import uniqid from "uniqid";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { blogValidation } from "./validation.js";

import { readBlogs , writeBlogs } from "../../lib/tools.js"

const blogPostsRouter = express.Router();



blogPostsRouter.get("/", async (req, res, next) => {
  try {
    //read
    const blogs = await readBlogs()

    //send back the array
    res.status(200).send(blogs);
  } catch (error) {
    next(error);
  }
});



blogPostsRouter.get("/:blogPostId", async (req, res, next) => {
  try {
    //read
    const blogs = await readBlogs()

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



blogPostsRouter.post("/", blogValidation , async (req, res, next) => {
  try {
    const errorsList = validationResult(req);

    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    } else {
      //spread the req.body
      const createdPost = { _id: uniqid(), ...req.body, createdAt: new Date() };

      const blogs = await readBlogs()

      blogs.push(createdPost);

      //write everything back to the json
      await writeBlogs(blogs)

      //send back the id of the newly created post
      res.status(201).send({ _id: blogs._id });
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.put("/:blogPostId", async (req, res, next) => {
  try {
    const blogs = await readBlogs()

    const index = blogs.findIndex((blog) => blog._id === req.params.blogPostId);

    const newBlogPost = { ...blogs[index], ...req.body };

    blogs[index] = newBlogPost;

    await writeBlogs(blogs)

    res.send(newBlogPost);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.delete("/:blogPostId", async (req, res, next) => {
  try {
    const blogs = await readBlogs()

    const blogsArray = blogs.filter(
      (blogs) => blogs._id !== req.params.blogPostId
    );

    await writeBlogs(blogsArray)

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default blogPostsRouter;