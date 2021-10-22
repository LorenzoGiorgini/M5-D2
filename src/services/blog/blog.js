import express from "express";
import uniqid from "uniqid";
import multer from "multer";
import { extname } from "path";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { blogValidation } from "./validation.js";

import { readBlogs, writeBlogs, blogsCover } from "../../lib/tools.js";

const blogPostsRouter = express.Router();

blogPostsRouter.get("/", async (req, res, next) => {
  try {
    //read
    const blogs = await readBlogs();

    //send back the array
    res.status(200).send(blogs);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/:blogPostId", async (req, res, next) => {
  try {
    //read
    const blogs = await readBlogs();

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

blogPostsRouter.post("/", blogValidation, async (req, res, next) => {
  try {
    const errorsList = validationResult(req);

    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    } else {
      //spread the req.body
      const createdPost = {
        _id: uniqid(),
        ...req.body,
        createdAt: new Date(),
        comments: [],
      };

      const blogs = await readBlogs();

      blogs.push(createdPost);

      //write everything back to the json
      await writeBlogs(blogs);

      //send back the id of the newly created post
      res.status(201).send(createdPost);
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.post(
  "/:blogPostId/uploadCover",
  multer().single("cover"),
  async (req, res, next) => {
    try {
      const errorsList = validationResult(req);

      if (!errorsList.isEmpty()) {
        next(createHttpError(400, { errorsList }));
      } else {
        console.log(req.file);
        const extension = extname(req.file.originalname);
        await blogsCover(req.params.blogPostId + extension, req.file.buffer);
        const blogs = await readBlogs();
        const blogsUrl = blogs.find(
          (blog) => blog._id === req.params.blogPostId
        );
        const coverUrl = `http://localhost:3001/img/blogCover/${req.params.blogPostId}${extension}`;
        blogsUrl.cover = coverUrl;
        const blogsArray = blogs.filter(
          (blogs) => blogs._id !== req.params.blogPostId
        );
        blogsArray.push(blogsUrl);
        await writeBlogs(blogsArray.reverse());
        res.send(200);
      }
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.put("/:blogPostId", async (req, res, next) => {
  try {
    const blogs = await readBlogs();

    const index = blogs.findIndex((blog) => blog._id === req.params.blogPostId);

    const newBlogPost = { ...blogs[index], ...req.body };

    blogs[index] = newBlogPost;

    await writeBlogs(blogs);

    res.send(newBlogPost);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.delete("/:blogPostId", async (req, res, next) => {
  try {
    const blogs = await readBlogs();

    const blogsArray = blogs.filter(
      (blogs) => blogs._id !== req.params.blogPostId
    );

    await writeBlogs(blogsArray);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

//comments of the blogs

blogPostsRouter.post("/:blogPostId/comments", async (req, res, next) => {
  try {
    const blogs = await readBlogs();
    const index = blogs.findIndex((blog) => blog._id === req.params.blogPostId);
    if (index !== -1) {
      blogs[index].comments.push({
        ...req.body,
        id: uniqid(),
        createdAt: new Date(),
      });
      await writeBlogs(blogs);
      res.send(blogs[index].comments);
    } else {
      res.status(404).send("not found");
    }

    //re join them back
  } catch (error) {
    console.log(error);
    next(error);
  }
});

blogPostsRouter.get("/:blogPostId/comments", async (req, res, next) => {
  try {
    const blogs = await readBlogs();
    const findBlog = blogs.find((blog) => blog._id === req.params.blogPostId);
    if (findBlog) {
      res.status(200).send(findBlog.comments);
    } else {
      res.status(404).send("Comment not found");
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.put(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogs = await readBlogs();

      const findBlog = blogs.find((blog) => blog._id === req.params.blogPostId);

      const index = blogs.findIndex(
        (blog) => blog._id === req.params.blogPostId
      );

      const filteredCommentIndex = findBlog.comments.findIndex(
        (comment) => comment.id === req.params.commentId
      );

      blogs[index].comments[filteredCommentIndex] = {
        ...blogs[index].comments[filteredCommentIndex],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };

      await writeBlogs(blogs);

      res.send("ok");
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.delete(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogs = await readBlogs();

      const findBlog = blogs.find((blog) => blog._id === req.params.blogPostId);

      const index = blogs.findIndex(
        (blog) => blog._id === req.params.blogPostId
      );

      const filteredComments = findBlog.comments.filter(
        (comment) => comment.id !== req.params.commentId
      );

      findBlog.comments = filteredComments;

      blogs[index] = findBlog;

      await writeBlogs(blogs);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default blogPostsRouter;