# DECOR8

[![Coverage Status](https://coveralls.io/repos/github/sueanyv/Decor8/badge.svg?branch=master)](https://coveralls.io/github/sueanyv/Decor8?branch=master)

# Overview

+ This REST API is designed to function for a website where people can post pictures of furniture, decorations or other household items in which they would like to have help finding something similar from the community of users. It could however be applied to many other functionalities.
+ It is a fully CRUD API and can support post, get, put, and delete routes on any of our 4 models and supports signin and signup functionality on another User model.
    + **User** - Holds just the login and a hashed reference to the password.
    + **Profile** - Meant to store basic information about the user and a profile picture uri (stored in S3).
    + **Category** - Contains a name, desc, and time created of the category as well as a list of all the posts in the category.
    + **Post** - Stores the user whom created the Post, which category the post belongs to, a list of all the comments on the post,  a picture uri for the post (stored in s3), and a description of what the user is looking for in the post.
    + **Comment** - Holds references to the user who created the comment and the post that the comment was made on. It also holds the comment message that was made as well as the picutre that was associated with it (also stored in s3) and when the comment was created.

# General Website Flow/ How to send a request using HTTPie

## PROFILE
            __Endpoints__ __&__ __Example__ __HTTPie__ __Requests__

            Post   | api/profile          Will create a profile for a user.

            http -f POST https://production-decorate.herokuapp.com/api/profile name="example name" bio="example bio" userId="Id of User" image@exampleimage/path

            Get    | api/profile/:id      Will get all properties of a users profile.

            http GET https://production-decorate.herokuapp.com/api/profile/[usersId]

            Put    | api/profile/:id      Will update a user's profile.

            http -f PUT https://production-decorate.herokuapp.com/api/profile/[usersId] name="new example name" bio="new example bio"

            Delete | api/profile/:id      Will delete a user's profile.

            http DELETE https://production-decorate.herokuapp.com/api/profile/[usersId]

## CATEGORY
            __Endpoints__ __&__ __Example__ __HTTPie__ __Requests__

            Post   | api/category          Will create a category.

            http -f POST https://production-decorate.herokuapp.com/api/category categoryType="category example" desc="example description"

            Get    | api/category/:id      Will get all properties of a users category. Will populate with list of Post's associated.

            http GET https://production-decorate.herokuapp.com/api/category/[categoryId]

            Put    | api/category/:id      Will update a category name or description.

            http -f PUT https://production-decorate.herokuapp.com/api/category[categoryId] categoryType="new category example" desc="new example description"

            Delete | api/category/:id      Will delete a category.

            http DELETE https://production-decorate.herokuapp.com/api/category/[categoryId]

## POST
            __Endpoints__ __&__ __Example__ __HTTPie__ __Requests__

            Post   | api/category/:categoryID/post          Will create a post for a user associated with a Category.

            http -f POST https://production-decorate.herokuapp.com/api/post name="example name" desc="example description" price="Integer" userID="user's id" categoryID="asscoiated category ID" image@[image path]

            Get    | api/post/:id                           Will get all properties of a users post and populate comments on post.

            http GET https://production-decorate.herokuapp.com/api/post/[postId]

            Put    | api/post/:id                           Will update a user's post.

            http -f PUT https://production-decorate.herokuapp.com/api/post/[postId] name="example name" desc="example description" price="Integer" userID="user's id" categoryID="asscoiated category ID"

            Delete | api/category/:categoryID/post/:id      Will delete a user's post and remove its association from category.

            http DELETE https://production-decorate.herokuapp.com/api/post/[postId]

## COMMENT
            __Endpoints__ __&__ __Example__ __HTTPie__ __Requests__

            Post   | api/postID/:postId/comment            Will create a comment for a user associated with a post.

            http -f POST https://production-decorate.herokuapp.com/api/comment message="example message" image@[image file path]

            Get    | api/comment/:commentId                Will get all properties of a comment.

            http GET https://production-decorate.herokuapp.com/api/comment/[comment id]

            Put    | api/comment/:commentId                Will update a user's comment.

            http -f PUT https://production-decorate.herokuapp.com/api/comment/[comment id] message="new example message"

            Put    | api/comment/:commentId/upvote

            http -f PUT https://production-decorate.herokuapp.com/api/comment/[comment id] message="new example message"

            Delete | api/post/:postId/comment/:commentId   Will delete a user's comment, and remove association with a post.

            http DELETE https://production-decorate.herokuapp.com/api/comment/[comment id]


## Example Post

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



# About The Developers

<img src="images/cayla.jpg" width="400">

### Cayla Zabel

Before learning how to code, Cayla was pursuing a career in the healthcare field. She has a passion to help people and wants to make an impact on both the community and the world. Cayla decided to look into coding because her brother is a successful software developer. She has been able to expose herself to the field. It was intriguing to watch an idea turn into a real application on the web. She chose JavaScript in particular because there is so much room for growth in the field. JavaScript is always changing which allows her to be a lifelong learner. Eventually Cayla wants to take her knowledge in technology and apply it to healthcare and have the ability to help people on a global scale with new applications.

<img src="images/jeremiah.jpg" width="400">

### Jeremiah Walters

My name is Jeremiah Walters and I am a Full-Stack JavaScript Developer.  I consider myself an User Experience Advocate.  Prior to programming I worked as a professional in the service industry for 8 years and a year ago I discovered that I have an empathetic passion for the user experience.  I realized that technology is incorporated with everything we do on a daily basis.  By using skills I developed in the service industry, combined with a powerful language such as JavaScript,  I can make everyone’s day to day experience with technology better.  I would be a great asset to any team that believes in continuous integration, innovation and values the user experience.

<img src="images/sugey.jpg" width="400">

### Sugey Valencia

My name is Sugey Valencia , I am an Air Force veteran  and I also worked for the department of veterans affairs. I decided to become a software developer because I wanted to create, contribute and challenge myself. I love that we can use code to create things from the ground up. With coding I am constantly challenged and learning new skills. Most importantly I hope to one day help build technology that can change the world for the better.

<img src="images/brian.jpg" width="400">

### Brian Alspach

Before coming to CodeFellows I worked as an Assistant Real Estate Manager at CBRE, Inc. I was able to work with clients to problem solve solutions for issues that came up. I enjoyed working to help people and still do. When dabbling with some code I discovered a real passion for the logic behind what makes a website run. As I have continued my journey into coding that passion has continued to grow. I chose to specialize in JavaScript because it is such a robust language has been a great base language to branch out to all the different things I want to do in coding. Ideally I see myself on a team of developers working with logic and data sto create applications that solve real issues.
