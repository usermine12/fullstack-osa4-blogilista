const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const logger = require('../utils/logger')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1})
  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body

  const user = await User.findById(body.userId)

  if(!body.title || !body.url){
    return response.status(400).end()
  }

  let blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  if(!body.likes){
    blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: 0,
      user: user._id
    })
  }

  logger.info(blog)

  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.json(savedBlog.toJSON())
  } catch (e) {
    next(e)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    const id = request.params.id
    await Blog.findByIdAndDelete(id)
    response.status(204).end()
  } catch (e) {
    next(e)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  try {
    const id = request.params.id
    const body = request.body

    let blog = {
      body: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
    }

    if(!body.likes){
      blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: 0
      }
    }

    const newBlog = await Blog.findByIdAndUpdate(id, blog, { new: true})
    response.status(204).json(newBlog.toJSON())
  } catch (e) {
    next(e)
  }
})

module.exports = blogsRouter
