import { body } from "express-validator"


export const blogValidation = [
  body("category").exists().withMessage("category is a mandatory field!"),
  body("title").exists().withMessage("title is a mandatory field!"),
  body("cover").exists().withMessage("Cover is a mandatory field!")
]