import fs from "fs-extra"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const dataFolder = join(dirname(fileURLToPath(import.meta.url)), "../data")

const authorsFolder = join(dataFolder , "authors.json")
const blogFolder = join(dataFolder , "blog.json")
const publicFolderAuthors = join(process.cwd() , "./public/img/authors/")
const publicFolderBlogs = join(process.cwd() , "./public/img/blogCover/")

export const readAuthors = () => fs.readJSON(authorsFolder)
export const writeAuthors = (content) => fs.writeJSON(authorsFolder , content)
export const readBlogs = () => fs.readJSON(blogFolder)
export const writeBlogs = (content) => fs.writeJSON(blogFolder , content)

export const authorsAvatarPic = (fileName , buffer) => {
    writeFile(join(publicFolderAuthors , fileName) , buffer)

    return publicFolderAuthors + fileName
}

export const blogsCover = (fileName , buffer) => {
    writeFile(join(publicFolderBlogs , fileName) , buffer)

    return publicFolderBlogs + fileName
}