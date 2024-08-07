const dummy = (blogs) => {
    return 1
  }

const totalLikes = (blogs) => {
    const reducer = (sum, blog) => {
        return sum + blog.likes;
    }

    return blogs.reduce(reducer, 0);

}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null
    } else {
        const blog = blogs.reduce((max, blog) => (blog.likes > max.likes ? blog : max));
        return {
            title: blog.title, 
            author: blog.author, 
            likes: blog.likes
        }
    }
}
  
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
  }