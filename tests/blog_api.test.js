const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

test('there are six blogs that are json', async () => {
    const response = await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, 5)
})

test('blog identification is called id', async () => {
    const blogs = await helper.blogsInDb()

    blogs.forEach(blog => {
        assert.ok(blog.id)
    })
})

test('a valid blog can be added', async () => {
    const newBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2
    }

    await api 
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
    const response = await api.get('/api/blogs')
    const titles = response.body.map(blog => blog.title)

    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
    assert(titles.includes('Type wars'))
})

test('no likes value gives likes a zero', async () => {
    const newBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html"
    }

    await api 
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const addedBlog = response.body.find(blog => blog.title === 'Type wars')

    assert.strictEqual(addedBlog.likes, 0)
})

test('blog without a title gives 400', async () => {
    const newBlog = {
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2
    }

    await api 
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

    const blogs = await helper.blogsInDb()
    assert.strictEqual(blogs.length, helper.initialBlogs.length)

})

test('blog without an url gives 400', async () => {
    const newBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        likes: 2
    }

    await api 
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

    const blogs = await helper.blogsInDb()
    assert.strictEqual(blogs.length, helper.initialBlogs.length)

})

test('deletion will succeed with 204', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)
    
    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    assert(!titles.includes(blogToDelete.title))
})

test('updating amount of likes with plus one', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
        ...blogToUpdate,
        likes: blogToUpdate.likes + 1
    }

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)
    
    const blogsAtEnd = await helper.blogsInDb()
    const updated = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)

    assert.strictEqual(updated.likes, blogToUpdate.likes + 1)
})

test('updating amount of likes to 100', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
        ...blogToUpdate,
        likes: 100
    }

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)
    
    const blogsAtEnd = await helper.blogsInDb()
    const updated = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)

    assert.strictEqual(updated.likes, 100)
})

test('updating url', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
        ...blogToUpdate,
        url: "google.fi"
    }

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)
    
    const blogsAtEnd = await helper.blogsInDb()
    const updated = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)

    assert.strictEqual(updated.url, "google.fi")
})

after(async () => {
    await mongoose.connection.close()
  })

    
