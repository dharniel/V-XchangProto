const views = __dirname + '/../views';
const user = require("../app/user.js")
var viewPostData; 
var viewRequestData;
var idForComments;
var commentPassBack;
var profileId;

module.exports = function (app, passport, io) {

    /** AUTHENTICATION */
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    app.get('/auth/google/redirect', passport.authenticate('google', {
        successRedirect : '/feed',
        failureRedirect : '/login'
    }));


    /** GET REQUESTS */
    /* GENERAL */
    //Index
    app.get('/', isLoggedIn, function(req, res) {
        res.sendFile('feed.html', {root: views});
    });

    //Login
    app.get('/login', function(req, res) {
        res.sendFile('login.html', {root: views});
    });

    //Profile
    app.get('/profile', isLoggedIn, function(req, res) {
        res.sendFile('profile.html', {root: views, user: req.user});
    });

    //Settings and Preferences
    app.get('/preferences', isLoggedIn, function(req, res) {
        res.sendFile('preferences.html', {root: views, user: req.user});
    });

    //Display User's Followed Courses
    app.get('/mycourses', isLoggedIn, function(req, res) {
        res.sendFile('mycourses.html', {root: views, user: req.user});
    });

    //Display User's Saved/Followed Book Posts and Requests
    app.get('/mypostfollows', isLoggedIn, function(req, res) {
        res.sendFile('viewpostfollows.html', {root: views, user: req.user});
    });

    app.get('/mypassword', async (req, res) => {
        res.sendFile('mypassword.html', {root: views})
    })

    app.get('/myposts', async (req, res) => {
        res.sendFile('viewpersonalposts.html', {root: views})
    })

    app.get('/logout', function(req, res) {
        req.logout(); //Passports logout function
        req.session.destroy();
        res.redirect('/');
    });

    //Retrieve All Courses offered by Institution
    app.get('/courses', isLoggedIn, async (req, res) => {
        var data = await user.retrieveCourses();
        res.send(data);
    })

    //Retrieve Courses that the User Follows
    app.get('/coursesFollowed', isLoggedIn, async (req, res) => {
        var data = await user.retrieveCoursesFollowed(req.user.id);
        res.send(data)
    })

    //Retrieve User's Notifications
    app.get('/notifications', isLoggedIn, async (req, res) => {
        var data = await user.retrieveNotifications(req);
        var cleanedData = await cleanNotifData(data, req.user.id)
        res.send(cleanedData)
    })

    function cleanNotifData (data, id) {
        return new Promise((resolve) => {
            var cleanedData = data.map(x => {
                if (x.editorId == id) {
                    x.firstName = "You"
                    x.lastName = ""
                }
                if (x.editorId == x.posterId) {
                    x.posterFirstName = "their" //As gender neutral reference
                    x.posterLastName = ""
                }
                if (x.posterId == id) {
                    x.posterFirstName = "your"
                    x.posterLastName = ""
                    return x
                }
                return x
            });
            var cleanedData = cleanedData.filter(x => x.firstName !== "You");
            return resolve(cleanedData);
        })
    }

    function cleanCommentData (data, id) {
        var x = data.map(item => {
            if (item.userId == id) {
                item.firstName = "You"
                item.lastName = ""
            }
            return item
        })
        return x;
    }

    //Clean up individual commments going to pages live
    app.get('/cleanCommentPost/', isLoggedIn, async (req, res) => {
        var post = req.query
        var checkId = req.user.id
        var data = cleanCommentData([post], checkId)
        res.send(data)
    })

    //Clean up individual commments going to pages live
    app.get('/cleanCommentNotif/', isLoggedIn, async (req, res) => {
        var notification = req.query
        notifdata = await user.retrieveNotification(notification.postId)
        res.send((await cleanNotifData(notifdata, req.user.id))[0])
    })

    //Checks to see if User follows a Book Post/Request with the specified id.
    app.get('/checkpostfollow/:postId', isLoggedIn, async (req, res) => {
        var postId = req.params.postId
        var data = await user.checkPostFollow(req, postId)
        res.send(data)
    })

    app.get('/checkcoursefollow/:courseId', isLoggedIn, async (req, res) => {
        var courseId = req.params.courseId
        var data = await user.checkCourseFollow(req, courseId)
        res.send(data)
    })

    app.get('/fetchprofile', async (req, res) => {
        var data = await user.retrieveProfile(req.user.id);
        profileData = data
        let profileData2 = data[0].first_name + " " + data[0].last_name
        res.send(profileData2)
    })

    app.get('/fetchprofile2', async (req, res) => {
        var data = await user.retrieveProfile(req.user.id);
        var profileDataEdit = data[0];
        res.send(profileDataEdit)
    })

    /* FOR BOOKS */
    //Display Feed/Book Posts
    app.get('/feed', isLoggedIn, function(req, res) {
        res.sendFile('feed.html', {root: views, user: req.user});
    });

    //Display User's Textbooks
    app.get('/mytextbooks', isLoggedIn, function(req, res) {
        res.sendFile('mytextbooks.html', {root: views, user: req.user});
    });

    //Display User's Saved/Followed Textbooks
    app.get('/savedtextbooks', isLoggedIn, function(req, res) {
        res.sendFile('savedtextbooks.html', {root: views, user: req.user});
    });

    //Send details of Book Post being viewed
    app.get('/viewbookpostdeets', isLoggedIn, async (req, res) => {
        res.send(viewPostData);
    })

    //Send comments for Book Post being viewed
    app.get('/viewbookpostcomments/', isLoggedIn, async (req, res) => {
        res.send(viewCommentsData);
    })
    
    //Retrieve Book Posts for User
    app.get('/posts', isLoggedIn, async (req, res) => {
        var data = await user.retrievePosts(req);
        res.send(data);
    });

    //Retrive Book Posts for a particular course for the User
    app.get('/postsforcourse/:name', isLoggedIn, async (req, res) => {
        var name = req.params.name;
        var coursedata = await user.retrieveCoursePost(req, name);
        res.send(coursedata);
    });

    //Retrieve details of all Book Posts by User 
    app.get('/bookpostedit', isLoggedIn, async (req, res) => {
        var data = await user.retrievePersonalPosts(req);
        res.send(data);
    });

    //Retrieve Book Posts a User follows
    app.get('/gettextbookfollow', isLoggedIn, async (req, res) => {
        var data = await user.retrieveBooksFollow(req);
        res.send(data);
    });

    //Retrieve details of a Book Post
    app.get('/viewbookpost/:postId', isLoggedIn, async (req, res) => {
        commentPassBack = req.url;
        var postId = await req.params.postId
        idForComments = postId;
        var data = await user.retrievePost(postId)
        var comments = await user.retrieveComments(postId)
        viewPostData = data;
        viewCommentsData = cleanCommentData(comments, req.user.id);
        res.sendFile('viewbookpost.html', {root: views})
    })

    //Retrieves details of a Book Post with specified id for User to edit
    app.get('/viewbookpostedit/:postId', isLoggedIn, async (req, res) => {
        commentPassBack = req.url;
        var postId = req.params.postId
        idForComments = postId;
        await user.retrievePersonalPosts(req)
        var data = await user.retrievePersonalPost(postId)
        viewPostData = data[0]
        res.sendFile('viewbookedit.html', {root: views})
    })

    //Retrieve results of a search for Book Posts
    app.get('/postsSearch/:value', isLoggedIn, async (req, res) => {
        var value = req.params.value
        var data = await user.retrievePostSearch(value)
        res.send(data)
    })

    //Sorts Book Posts by Time (Ascending)
    app.get('/sortTimeAsc', isLoggedIn, async (req, res) => {
        var data = await user.retrievePostsByTimeUp(req)
        res.send(data)
    })

    //Sorts Book Posts by Time (Descending)
    app.get('/sortTimeDesc', isLoggedIn, async (req, res) => {
        var data = await user.retrievePostsByTimeDown(req)
        res.send(data)
    })

    //Sorts Book Posts by Course (Ascending)
    app.get('/sortCourseAsc', isLoggedIn, async (req, res) => {
        var data = await user.retrievePostsByCourseUp(req)
        res.send(data)
    })

    //Sorts Book Posts by Course (Descending)
    app.get('/sortCourseDesc', isLoggedIn, async (req, res) => {
        var data = await user.retrievePostsByCourseDown(req)
        res.send(data)
    })

    /* FOR REQUESTS */
    //Display Book Requests
    app.get('/requests', isLoggedIn, function(req, res) {
        res.sendFile('requests.html', {root: views, user: req.user});
    });

    //Display User's Requests
    app.get('/myrequests', isLoggedIn, function(req, res) {
        res.sendFile('myrequests.html', {root: views, user: req.user});
    });

    //Display User's Saved/Followed Requests
    app.get('/savedrequests', isLoggedIn, function(req, res) {
        res.sendFile('savedrequests.html', {root: views, user: req.user});
    });
 
    //Send details of the Request being viewed
    app.get('/viewrequestpostdeets', isLoggedIn, async (req, res) => {
        res.send(viewRequestData);
    })

    //Send comments of the Request being viewed
    app.get('/viewbookrequestcomments/', isLoggedIn, async (req, res) => {
        res.send(viewCommentsData);
    })

    //Retrieve Requests for User
    app.get('/allrequests', isLoggedIn, async (req, res) => {
        var data = await user.retrieveRequests(req);
        res.send(data);
    });

    //Retrieve Requests for a particular course for the User
    app.get('/requestsforcourse/:name', isLoggedIn, async (req, res) => {
        var name = req.params.name;
        var coursedata = await user.retrieveCourseRequest(req, name);
        res.send(coursedata);
    });

     //Retrieve Requests for User to edit
     app.get('/requestpostedit', isLoggedIn, async (req, res) => {
        var data = await user.retrievePersonalRequests(req);
        res.send(data)
    })

    //Retrieve Requests a User follows
    app.get('/getrequestfollow', isLoggedIn, async (req, res) => {
        var data = await user.retrieveRequestsFollow(req);
        res.send(data)
    })

    //Retrieve details of a Request
    app.get('/viewbookrequest/:postId', isLoggedIn, async (req, res) => {
        commentPassBack = req.url;
        var postId = req.params.postId
        idForComments = postId;
        await user.retrieveRequests(req)
        var data = await user.retrieveRequest(postId)
        var comments = await user.retrieveComments(postId)
        viewRequestData = data;
        viewCommentsData = cleanCommentData(comments, req.user.id);
        res.sendFile('viewrequest.html', {root: views})
    })

    //Retrieves details of a Request for User to edit
    app.get('/viewrequestpostedit/:postId', isLoggedIn, async (req, res) => {
        commentPassBack = req.url;
        var postId = req.params.postId
        idForComments = postId;
        await user.retrievePersonalRequests(req)
        var data = await user.retrievePersonalRequest(postId)
        viewRequestData = data[0]
        res.sendFile('viewrequestedit.html', {root: views})
    })

    //Retrieve results for a search for Requests
    app.get('/requestsSearch/:value', isLoggedIn, async (req, res) => {
        var value = req.params.value
        var data = await user.retrieveRequestSearch(value)
        res.send(data)
    })

    //Sorts Requests by Time (Ascending)
    app.get('/sortTimeAscReq', isLoggedIn, async (req, res) => {
        var data = await user.retrieveRequestsByTimeUp(req)
        res.send(data)
    })

    //Sorts Requests by Time (Descending)
    app.get('/sortTimeDescReq', isLoggedIn, async (req, res) => {
        var data = await user.retrieveRequestsByTimeDown(req)
        res.send(data)
    })

    //Sorts Requests by Course (Ascending)
    app.get('/sortCourseAscReq', isLoggedIn, async (req, res) => {
        var data = await user.retrieveRequestsByCourseUp(req)
        res.send(data)
    })

    //Sorts Requests by Course (Descending)
    app.get('/sortCourseDescReq', isLoggedIn, async (req, res) => {
        var data = await user.retrieveRequestsByCourseDown(req)
        res.send(data)
    })


    /** POST REQUESTS */
    // Upload new Book Post
    app.post('/textbook', async (req, res) => {
        try {
            await user.postTextbook(req)
            io.emit('notifyNew', req.body.textbookCourse)
            res.status(200).redirect('/feed')
        } catch (err) {
            console.log(err)
            res.sendStatus(500)
        } finally {
            console.log("textbook post request completed")
        }
    })

    //Upload new Request
    app.post('/request', isLoggedIn, async (req, res) => {
        try {
            await user.postRequest(req)
            res.status(200).redirect('/requests')
        } catch (err) {
            console.log(err)
            res.sendStatus(500)
        } finally {
            console.log("request post request completed")
        }
    })

    //Post comment on BookPost/Request
    app.post('/comment', isLoggedIn, async (req, res) => {
        var postId;
        var notifdata;
        try {
            await user.postComment(req.body.commentDescription, req.user.id, idForComments)
            postId = await user.retrievePostId()
            postId = postId[0].value
            await user.addNotificationComm(req, postId)
            notifdata = await user.retrieveNotification(postId)
            var firstName = notifdata[0].firstName; 
            var lastName = notifdata[0].lastName;
            var time = Date.now();
            var post = {
                postTime: time, 
                firstName: firstName,
                lastName: lastName, 
                comment: req.body.commentDescription, 
                userId: req.user.id
            }
            io.emit('notifyPost', notifdata[0])
            io.emit('commentPosted', post)
            res.status(200)
        } catch (err) {
            console.log(err)
            res.sendStatus(500)
        } finally {
            console.log("comment post request completed")
        }
    })

    //Update User Profile
    app.post('/updateProfile', isLoggedIn,  async (req, res) => {
        try {
            await user.postProfile(req)
            res.status(200).redirect('/profile')
        } catch (err) {
            console.log(err)
            res.sendStatus(500)
        } finally {
            console.log("profile update completed")
        }
    })

    //Add course to courses a user follows 
    app.post('/addFollow', isLoggedIn, async (req, res) => {
        var courseCode = req.body.courseCode
        try {
            await user.addFollow(courseCode, req.user.id);
            console.log(courseCode)
            res.status(200)
        } catch (err) {
            console.log(err)
            res.sendStatus(500)
        } finally {
            console.log("course follow request completed")
        }
    })

    //Remove Course from courses user follows
    app.post('/removeFromFollow/', isLoggedIn, async (req, res) => {
        var courseCode = req.body.courseCode
        try {
            await user.removeFollow(courseCode, req.user.id);
            res.status(200)
        } catch (err) {
            console.log(err)
            res.sendStatus(500)
        } finally {
            console.log("course removal completed")
        }
    })

    //Delete a post or request
    app.post('/deletepostrequest/', isLoggedIn, async (req, res) => {
        var postId = req.body.postId
        try {
            await user.deletepost(postId)
            res.status(200)
        } catch (err) {
            console.log(err)
            res.sendStatus(500)
        } finally {
            console.log("delete post completed")
        }
    })

    //Update Book Post details
    app.post('/textbookEdit', isLoggedIn, async (req, res) => {
        var notifdata
        try {
            id = viewPostData.postId;
            var oldDesc = await user.retrieveBookDescription(id)
            var oldCost = await user.retrieveBookCost(id)
            var textbookCost = req.body.textbookCost;
            var textbookDescription = req.body.textbookDescription;
            if ((textbookCost != oldCost) || (textbookDescription != oldDesc)) {
                await user.addNotificationBook(req, id)
                await user.editBookPost(req, id, viewPostData.postTextbookId)
                await user.retrievePosts(req)
                notifdata = await user.retrieveNotification(id)
                io.emit('notifyPost', notifdata[0])
            }
            res.status(200).redirect('/mytextbooks')
        } catch (err) {
            console.log(err)
            res.sendStatus(500)
        } finally {
            console.log("textbook edit completed")
        }
    })

    //Update Request details
    app.post('/requestEdit', isLoggedIn, async (req, res) => {
        var notifdata;
        try {
            id = viewRequestData.postId;
            var oldDesc = await user.retrieveRequestDescription(id)
            var requestDescription = req.body.requestDescription;
            if (requestDescription != oldDesc) {
                await user.addNotificationReq(req, id)
                await user.editRequestPost(req, id)
                await user.retrieveRequests(req)
                notifdata = await user.retrieveNotification(id)
                io.emit('notifyPost', notifdata[0])
            }
            res.status(200).redirect('/myrequests')
        } catch (err) {
            console.log(err)
            res.sendStatus(500)
        } finally {
            console.log("request edit completed")
        }
    })

    //Adds a Book Post/Request with a specified id to the list of posts followed by User
    app.post('/addpostfollow/', isLoggedIn, async (req, res) => {
        var postId = req.body.postId
        try {
            await user.addPostFollow(req, postId)
            res.status(200)
        } catch (err) {
            console.log(err)
            res.sendStatus(500)
        } finally {
            console.log("post save completed")
        }
    })

    //Removes a Book Post/Request with a specified id from the list of posts followed by User
    app.post('/removepostfollow/', isLoggedIn, async (req, res) => {
        var postId = req.body.postId
        try {
            await user.removePostFollow(req, postId)
            res.status(200)
        } catch (err) {
            console.log(err)
            res.sendStatus(500)
        } finally {
            console.log("post unsave completed")
        }
    })
}

//Middle-ware function for shielding url calls from non-Users.  
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login');
    }
    
}