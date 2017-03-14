#DECOR8

[![Coverage Status](https://coveralls.io/repos/github/sueanyv/Decor8/badge.svg?branch=category-model)](https://coveralls.io/github/sueanyv/Decor8?branch=category-model)

# Overview

+ This REST API is designed to function for a website where people can post pictures of furniture, decorations or other household items in which they would like to have help finding something similar from the community of users. It could however be applied to many other functionalities.
+ It is a fully CRUD API and can support post, get, put, and delete routes on any of our 4 models and supports signin and signup functionality on another User model.
    + **User** - Holds just the login and a hashed reference to the password.
    + **Profile** - Meant to store basic information about the user and a profile picture uri (stored in S3).
    + **Category** - Contains a name, desc, and time created of the category as well as a list of all the posts in the category.
    + **Post** - Stores the user whom created the Post, which category the post belongs to, a list of all the comments on the post,  a picture uri for the post (stored in s3), and a description of what the user is looking for in the post.
    + **Comment** - Holds references to the user who created the comment and the post that the comment was made on. It also holds the comment message that was made as well as the picutre that was associated with it (also stored in s3) and when the comment was created.

# General Website Flow

## PROFILE
            Endpoints                   
            Post   | api/profile          Will create a profile for a user.
            Get    | api/profile/:id      Will get all properties of a users profile.
            Put    | api/profile/:id      Will update a user's profile.
            Delete | api/profile/:id      Will delete a user's profile.

## CATEGORY
            Endpoints                   
            Post   | api/category          Will create a category.
            Get    | api/category/:id      Will get all properties of a users category. Will populate with list of Post's associated.
            Put    | api/category/:id      Will update a category name or description.
            Delete | api/category/:id      Will delete a category.

## POST
            Endpoints                   
            Post   | api/category/:categoryID/post          Will create a post for a user associated with a Category.
            Get    | api/post/:id                           Will get all properties of a users post and populate comments on post.
            Put    | api/post/:id                           Will update a user's post.
            Delete | api/category/:categoryID/post/:id      Will delete a user's post and remove its association from category.

## COMMENT
            Endpoints                   
            Post   | api/postID/:postId/comment            Will create a comment for a user associated with a post.
            Get    | api/comment/:commentId                Will get all properties of a comment.
            Put    | api/comment/:commentId                Will update a user's comment.
            Delete | api/post/:postId/comment/:commentId   Will delete a user's comment, and remove association with a post.


##Example Post

When making an appropriate api call you will get a matching response. Below are the parts of the call that you will need to include.

1. Header: You will need to include a header for most request 'including some get requests' that is of the following form.
```sh
Authorization: `Bearer ${yourTokenHere}`
```

![Gandalf](/images/401.jpg)

2. Body: You will also need to make sure to send a valid body that we c an work with. If you don't you will get a 400 error.

![Zoidberg](/images/400.jpg)

3. ID: For most items that are not Posts and some that are you will need to provide proper Ids to access the items you want.

![Link](/images/dead-link.jpg)

4. If you do your route with all of those accounted for you should get an appropriate response. For example this is a category with no posts attached as it would be returned form a get request. If there were attached posts it would be populated.

```
  categoryType: 'test category',
  desc: 'test desc',
  _id: '58c870f9ad72fe4d9b69f9c1',
  postList: [],
  created: '2017-03-14T22:38:49.008Z'
```
