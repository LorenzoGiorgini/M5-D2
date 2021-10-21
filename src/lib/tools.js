import fs from "fs-extra"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const { readJSON, writeJSON, writeFile } = fs

const dataFolder = join(dirname(fileURLToPath(import.meta.url)), "../data")

const authorsFolder = join(dataFolder , "authors.json")
const blogFolder = join(dataFolder , "blog.json")
const publicFolderAuthors = join(process.cwd() , "/src/public/img/authors/")
const publicFolderBlogs = join(process.cwd() , "/src/public/img/blogCover/")

export const readAuthors = () => readJSON(authorsFolder)
export const writeAuthors = (content) => writeJSON(authorsFolder , content)
export const readBlogs = () => readJSON(blogFolder)
export const writeBlogs = (content) => writeJSON(blogFolder , content)

export const authorsAvatarPic = (fileName , buffer) => {
    writeFile(join(publicFolderAuthors , fileName) , buffer)

    return publicFolderAuthors + fileName
}

export const blogsCover = (fileName , buffer) => {
    writeFile(join(publicFolderBlogs , fileName) , buffer)

    return publicFolderBlogs + fileName
}