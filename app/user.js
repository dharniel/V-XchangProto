const Database = require('../config/database')
const db = new Database(); 

module.exports = { 
    /** BOOK POSTS */
    //Retrieve all Book Posts
    retrievePosts (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.description_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, textbook.id as postTextbookId,\
            course.course_instructor as postCourseInstructor, textbook.book_title as postBookTitle, textbook.author as postBookAuthor, textbook.cost as postBookCost\
            from post inner join users inner join textbook inner join course\
            on post.course_id = course.id\
            and post.textbook_id = textbook.id\
            and users.id = post.user\
            where post.classtype = ? and course.course_code IN (select course_code from following where following.user_id = ?)"
            return resolve(db.query(sql, ["Textbook", req.user.id]));
        })
    },

    //Retrieve Book Post with specified id
    retrievePost(id) {
        return new Promise (async (resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as  postViews, \
            post.description_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, textbook.id as postTextbookId,\
            course.course_instructor as postCourseInstructor, textbook.book_title as postBookTitle, textbook.author as postBookAuthor, textbook.cost as postBookCost\
            from post inner join users inner join textbook inner join course\
            on post.course_id = course.id\
            and post.textbook_id = textbook.id\
            and users.id = post.user\
            where post.id = ?"
            var sql2 = "UPDATE post SET views = ? WHERE id = ?"
            var post = (await db.query(sql, id))[0];
            var postViews = parseInt(post.postViews) + 1;
            await db.query(sql2, [postViews, id]);
            return resolve(post);
        })
    },

    //Retrieve Book Posts made by User
    retrievePersonalPosts (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as  postViews, \
            post.description_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, textbook.id as postTextbookId,\
            course.course_instructor as postCourseInstructor, textbook.book_title as postBookTitle, textbook.author as postBookAuthor, textbook.cost as postBookCost\
            from post inner join users inner join textbook inner join course\
            on post.course_id = course.id\
            and post.textbook_id = textbook.id\
            and users.id = post.user\
            where post.classtype = ? AND users.id = ?"
            return resolve(db.query(sql, ["Textbook", req.user.id]));
        })
    },

    //Retrieve a Book Post made by User given Post Id
    retrievePersonalPost(id) {
        return new Promise ((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as  postViews, \
            post.description_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, textbook.id as postTextbookId,\
            course.course_instructor as postCourseInstructor, textbook.book_title as postBookTitle, textbook.author as postBookAuthor, textbook.cost as postBookCost\
            from post inner join users inner join textbook inner join course\
            on post.course_id = course.id\
            and post.textbook_id = textbook.id\
            and users.id = post.user\
            where post.id = ?"
            return resolve(db.query(sql, id));
        })
    },

    //Retreieve Book Posts a User follows/saved
    retrieveBooksFollow (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.description_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, textbook.id as postTextbookId,\
            course.course_instructor as postCourseInstructor, textbook.book_title as postBookTitle, textbook.author as postBookAuthor, textbook.cost as postBookCost\
            from post inner join users inner join textbook inner join course\
            on post.course_id = course.id\
            and post.textbook_id = textbook.id\
            and users.id = post.user\
            where post.classtype = ? and post.id IN (select post_id from postfollow where postfollow.user_id = ?)"
            return resolve(db.query(sql, ["Textbook", req.user.id]));
        })
    },

    //Performs a deep search on the db and retrieve Book Post that has details containing seach value
    retrievePostSearch(value) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.description_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, textbook.id as postTextbookId,\
            course.course_instructor as postCourseInstructor, textbook.book_title as postBookTitle, textbook.author as postBookAuthor, textbook.cost as postBookCost\
            from post inner join users inner join textbook inner join course\
            on post.course_id = course.id\
            and post.textbook_id = textbook.id\
            and users.id = post.user\
            where post.classtype = ? and \
            (post.description_text like '%" + value + "%' or\
			users.first_name like '%" + value + "%' or \
			users.last_name like '%" + value + "%' or\
			course.course_title like '%" + value + "%' or\
			course.course_code like '%" + value + "%' or\
			course.course_instructor like '%" + value + "%'or\
			textbook.book_title like '%" + value + "%' or\
            textbook.author like '%" + value + "%')"
            return resolve(db.query(sql, "Textbook"));
        })
    },

    //Retrieve Book Posts for particular course
    retrieveCoursePost(req, name) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.description_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, textbook.id as postTextbookId,\
            course.course_instructor as postCourseInstructor, textbook.book_title as postBookTitle, textbook.author as postBookAuthor, textbook.cost as postBookCost\
            from post inner join users inner join textbook inner join course\
            on post.course_id = course.id\
            and post.textbook_id = textbook.id\
            and users.id = post.user\
            where post.classtype = ? and course.course_code = ? and course.course_code IN (select course_code from following where following.user_id = ?)"
            return resolve(db.query(sql, ["Textbook", name, req.user.id]));
        })
    },

    
    retrievePostsByTimeUp (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.description_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, textbook.id as postTextbookId,\
            course.course_instructor as postCourseInstructor, textbook.book_title as postBookTitle, textbook.author as postBookAuthor, textbook.cost as postBookCost\
            from post inner join users inner join textbook inner join course\
            on post.course_id = course.id\
            and post.textbook_id = textbook.id\
            and users.id = post.user\
            where post.classtype = ? and course.course_code IN (select course_code from following where following.user_id = ?)\
            order by postTime asc"
            return resolve(db.query(sql, ["Textbook", req.user.id]));
        })
    },

    retrievePostsByTimeDown (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.description_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, textbook.id as postTextbookId,\
            course.course_instructor as postCourseInstructor, textbook.book_title as postBookTitle, textbook.author as postBookAuthor, textbook.cost as postBookCost\
            from post inner join users inner join textbook inner join course\
            on post.course_id = course.id\
            and post.textbook_id = textbook.id\
            and users.id = post.user\
            where post.classtype = ? and course.course_code IN (select course_code from following where following.user_id = ?)\
            order by postTime desc"
            return resolve(db.query(sql, ["Textbook", req.user.id]));
        })
    },

    retrievePostsByCourseUp (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.description_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, textbook.id as postTextbookId,\
            course.course_instructor as postCourseInstructor, textbook.book_title as postBookTitle, textbook.author as postBookAuthor, textbook.cost as postBookCost\
            from post inner join users inner join textbook inner join course\
            on post.course_id = course.id\
            and post.textbook_id = textbook.id\
            and users.id = post.user\
            where post.classtype = ? and course.course_code IN (select course_code from following where following.user_id = ?)\
            order by postCourseCode asc"
            return resolve(db.query(sql, ["Textbook", req.user.id]));
        })
    },

    retrievePostsByCourseDown (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.description_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, textbook.id as postTextbookId,\
            course.course_instructor as postCourseInstructor, textbook.book_title as postBookTitle, textbook.author as postBookAuthor, textbook.cost as postBookCost\
            from post inner join users inner join textbook inner join course\
            on post.course_id = course.id\
            and post.textbook_id = textbook.id\
            and users.id = post.user\
            where post.classtype = ? and course.course_code IN (select course_code from following where following.user_id = ?)\
            order by postCourseCode desc"
            return resolve(db.query(sql, ["Textbook", req.user.id]));
        })
    },retrievePostsByTimeUp (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.description_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, textbook.id as postTextbookId,\
            course.course_instructor as postCourseInstructor, textbook.book_title as postBookTitle, textbook.author as postBookAuthor, textbook.cost as postBookCost\
            from post inner join users inner join textbook inner join course\
            on post.course_id = course.id\
            and post.textbook_id = textbook.id\
            and users.id = post.user\
            where post.classtype = ? and course.course_code IN (select course_code from following where following.user_id = ?)\
            order by postTime asc"
            return resolve(db.query(sql, ["Textbook", req.user.id]));
        })
    },

    retrievePostsByTimeDown (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.description_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, textbook.id as postTextbookId,\
            course.course_instructor as postCourseInstructor, textbook.book_title as postBookTitle, textbook.author as postBookAuthor, textbook.cost as postBookCost\
            from post inner join users inner join textbook inner join course\
            on post.course_id = course.id\
            and post.textbook_id = textbook.id\
            and users.id = post.user\
            where post.classtype = ? and course.course_code IN (select course_code from following where following.user_id = ?)\
            order by postTime desc"
            return resolve(db.query(sql, ["Textbook", req.user.id]));
        })
    },

    retrievePostsByCourseUp (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.description_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, textbook.id as postTextbookId,\
            course.course_instructor as postCourseInstructor, textbook.book_title as postBookTitle, textbook.author as postBookAuthor, textbook.cost as postBookCost\
            from post inner join users inner join textbook inner join course\
            on post.course_id = course.id\
            and post.textbook_id = textbook.id\
            and users.id = post.user\
            where post.classtype = ? and course.course_code IN (select course_code from following where following.user_id = ?)\
            order by postCourseCode asc"
            return resolve(db.query(sql, ["Textbook", req.user.id]));
        })
    },

    retrievePostsByCourseDown (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.description_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, textbook.id as postTextbookId,\
            course.course_instructor as postCourseInstructor, textbook.book_title as postBookTitle, textbook.author as postBookAuthor, textbook.cost as postBookCost\
            from post inner join users inner join textbook inner join course\
            on post.course_id = course.id\
            and post.textbook_id = textbook.id\
            and users.id = post.user\
            where post.classtype = ? and course.course_code IN (select course_code from following where following.user_id = ?)\
            order by postCourseCode desc"
            return resolve(db.query(sql, ["Textbook", req.user.id]));
        })
    },

    retrievePostsForCourse (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.description_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, textbook.id as postTextbookId,\
            course.course_instructor as postCourseInstructor, textbook.book_title as postBookTitle, textbook.author as postBookAuthor, textbook.cost as postBookCost\
            from post inner join users inner join textbook inner join course\
            on post.course_id = course.id\
            and post.textbook_id = textbook.id\
            and users.id = post.user\
            where post.classtype = ? and course.course_code IN (select course_code from following where following.user_id = ?)"
            return resolve(db.query(sql, ["Textbook", req.user.id]));
        })
    },

    postTextbook(req) {
        return new Promise(async (resolve) => {
            var textbookTitle = req.body.textbookTitle;
            var courseId = req.body.textbookCourse;
            var textbookAuthor = req.body.textbookAuthor;
            var textbookCost = req.body.textbookCost;
            var textbookDescription = req.body.textbookDescription;
            var userId = req.user.id;
            var postTime = Date.now();
            var views = 0;
            var classType = "Textbook";
            var sql1 = "INSERT INTO post SET ?";
            var sql2 = "INSERT INTO textbook SET ?";
            var sql3 = "SELECT MAX(id) as id FROM post"
            var sql4 = "SELECT MAX(id) as id FROM textbook"
            var sql5 = "UPDATE textbook SET book__post = ? WHERE id = ?"
            var sql6 = "UPDATE post SET textbook_id = ? WHERE id = ?"
            var fields1 = {
                post_time: postTime, 
                user: userId, 
                views: views, 
                classtype: classType, 
                course_id: courseId,
                description_text: textbookDescription
            }
            var fields2 = {
                book_title: textbookTitle, 
                author: textbookAuthor, 
                course_id: courseId, 
                cost: textbookCost
            }

            await db.query(sql1, fields1)
            await db.query(sql2, fields2)
            var textbookPostId = (await db.query(sql3))[0].id
            var textbookBookId = (await db.query(sql4))[0].id
            await db.query(sql5, [textbookPostId, textbookBookId])
            resolve(db.query(sql6, [textbookBookId, textbookPostId]))
        })
    }, 

    editBookPost(req, postId, bookId) {
        return new Promise(async (resolve) => {
            var textbookCost = req.body.textbookCost;
            var textbookDescription = req.body.textbookDescription;
            var sql1 = "UPDATE post SET description_text = ? WHERE id = ?"
            var sql2 = "UPDATE textbook SET cost = ? WHERE id = ?"
            var sql3 = "SELECT MAX(id) as id FROM notifications"
            var latestNotif = (await db.query(sql3))[0].id
            var sql4 = "UPDATE notifications SET new_desc = ?, new_cost = ? WHERE notifications.id = ?";
            await db.query(sql4, [textbookDescription, textbookCost, latestNotif])
            await db.query(sql1, [textbookDescription, postId])
            resolve (db.query(sql2, [textbookCost, bookId]))
        })
    }, 

    /** REQUESTS */

    retrieveRequests (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.request_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, \
            course.course_instructor as postCourseInstructor\
            from post inner join users inner join course\
            on post.course_id = course.id\
            and users.id = post.user\
            where post.classtype = ? AND course.course_code IN (select course_code from following where following.user_id = ?)"
            return resolve(db.query(sql, ["Request", req.user.id]));
        })
    },

    retrieveRequest(id) {
        return new Promise (async (resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.request_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, \
            course.course_instructor as postCourseInstructor\
            from post inner join users inner join course\
            on post.course_id = course.id\
            and users.id = post.user\
            where post.id = ?"
            var sql2 = "UPDATE post SET views = ? WHERE id = ?"
            var post = (await db.query(sql, id))[0]; 
            var postViews = parseInt(post.postViews) + 1;
            await db.query(sql2, [postViews, id]);
            return resolve(post);
        })
    },
    
    retrievePersonalRequests (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.request_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, \
            course.course_instructor as postCourseInstructor\
            from post inner join users inner join course\
            on post.course_id = course.id\
            and users.id = post.user\
            where post.classtype = ? AND users.id = ?"
            return resolve(db.query(sql, ["Request", req.user.id]));
        })
    },

    retrievePersonalRequest(id) {
        return new Promise ((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.request_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, \
            course.course_instructor as postCourseInstructor\
            from post inner join users inner join course\
            on post.course_id = course.id\
            and users.id = post.user\
            where post.id = ?"
            return resolve(db.query(sql, id))
        })
    },

    retrieveRequestsFollow (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.request_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, \
            course.course_instructor as postCourseInstructor\
            from post inner join users inner join course\
            on post.course_id = course.id\
            and users.id = post.user\
            where post.classtype = ? and post.id IN (select post_id from postfollow where postfollow.user_id = ?)"
            return resolve(db.query(sql, ["Request", req.user.id]));
        })
    },

    retrieveRequestSearch(value) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.request_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, \
            course.course_instructor as postCourseInstructor\
            from post inner join users inner join course\
            on post.course_id = course.id\
            and users.id = post.user\
            where post.classtype = ? and \
            (post.request_text like '%" + value + "%' or\
			users.first_name like '%" + value + "%' or \
			users.last_name like '%" + value + "%' or\
			course.course_title like '%" + value + "%' or\
			course.course_code like '%" + value + "%' or\
			course.course_instructor like '%" + value + "%')"
            return resolve(db.query(sql, "Request"));
        })
    },

    retrieveCourseRequest(req, name) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.request_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, \
            course.course_instructor as postCourseInstructor\
            from post inner join users inner join course\
            on post.course_id = course.id\
            and users.id = post.user\
            where post.classtype = ? and course.course_code = ? AND course.course_code IN (select course_code from following where following.user_id = ?)"
            return resolve(db.query(sql, ["Request", name, req.user.id]));
        })
    },

    retrieveRequestsByTimeUp (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.request_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, \
            course.course_instructor as postCourseInstructor\
            from post inner join users inner join course\
            on post.course_id = course.id\
            and users.id = post.user\
            where post.classtype = ? AND course.course_code IN (select course_code from following where following.user_id = ?)\
            order by postTime asc"
            return resolve(db.query(sql, ["Request", req.user.id]));
        })
    },

    retrieveRequestsByTimeDown (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.request_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, \
            course.course_instructor as postCourseInstructor\
            from post inner join users inner join course\
            on post.course_id = course.id\
            and users.id = post.user\
            where post.classtype = ? AND course.course_code IN (select course_code from following where following.user_id = ?)\
            order by postTime desc"
            return resolve(db.query(sql, ["Request", req.user.id]));
        })
    },

    retrieveRequestsByCourseUp (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.request_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, \
            course.course_instructor as postCourseInstructor\
            from post inner join users inner join course\
            on post.course_id = course.id\
            and users.id = post.user\
            where post.classtype = ? AND course.course_code IN (select course_code from following where following.user_id = ?)\
            order by postCourseCode asc"
            return resolve(db.query(sql, ["Request", req.user.id]));
        })
    },

    retrieveRequestsByCourseDown (req) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.request_text as postDescription, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail, course.course_code as postCourseCode, course.course_title as postCourseTitle, \
            course.course_instructor as postCourseInstructor\
            from post inner join users inner join course\
            on post.course_id = course.id\
            and users.id = post.user\
            where post.classtype = ? AND course.course_code IN (select course_code from following where following.user_id = ?)\
            order by postCourseCode desc"
            return resolve(db.query(sql, ["Request", req.user.id]));
        })
    },

    postRequest(req) {
        return new Promise((resolve) => {
            var courseId = req.body.requestCourse;
            var requestDescription = req.body.requestDescription;
            var userId = req.user.id;
            var postTime = Date.now();
            var views = 0;
            var classType = "Request";
            var sql = "INSERT INTO post SET ?";
            var fields = {
                post_time: postTime, 
                user: userId, 
                views: views, 
                classtype: classType, 
                course_id: courseId, 
                request_text: requestDescription
            }
            resolve(db.query(sql, fields))
        })
    }, 

    editRequestPost(req, postId) {
        return new Promise(async (resolve) => {
            var requestDescription = req.body.requestDescription;
            var sql = "UPDATE post SET request_text = ? WHERE id = ?"
            var sql2 = "SELECT MAX(id) as id FROM notifications"
            var latestNotif = (await db.query(sql2))[0].id
            var sql3 = "UPDATE notifications SET new_desc = ? WHERE notifications.id = ?";
            await db.query(sql3, [requestDescription, latestNotif])
            resolve(db.query(sql, [requestDescription, postId]))
        })
    }, 

    /** GENERAL */

    retrieveCourses() {
        return new Promise((resolve) => {
            var sql = 'SELECT * FROM course'
            return resolve(db.query(sql))
        })
    }, 

    retrieveCoursesFollowed(id) {
        return new Promise((resolve) => {
            var sql = 'SELECT course.course_code as course_code, course_title\
            FROM following inner join course inner join users\
            ON course.course_code = following.course_code\
            AND following.user_id = users.id\
            WHERE  users.id = ?'
            return resolve(db.query(sql, id))
        })
    }, 

    removeFollow(code, userid) {
        return new Promise((resolve) => {
            var sql = "DELETE FROM following WHERE course_code = ? AND user_id = ?"
            resolve(db.query(sql, [code, userid]))
        })
    },
    
    addFollow(id, userid) {
        return new Promise(async (resolve) => {
            var sql = "INSERT INTO following SET ?"
            var sql2 = "delete from following where course_code not in (select course_code from course)"
            var fields = {
                course_code: id, 
                user_id: userid
            }
            await db.query(sql, fields)
            resolve(db.query(sql2))
        })
    },

    addNotificationBook(req, postId) {
        return new Promise(async (resolve) => {
            var sql = "INSERT INTO notifications SET ?";
            var oldDesc = await this.retrieveBookDescription(postId)
            var oldCost = await this.retrieveBookCost(postId)
            var fields = {
                user_id: req.user.id, 
                post_id: postId, 
                old_desc: oldDesc, 
                old_cost: oldCost
            }
            resolve(db.query(sql, fields))
        })  
    },

    addNotificationReq(req, postId) {
        return new Promise(async (resolve) => {
            var sql = "INSERT INTO notifications SET ?";
            var oldDesc = await this.retrieveRequestDescription(postId)
            var fields = {
                user_id: req.user.id, 
                post_id: postId, 
                old_desc: oldDesc
            }
            resolve(db.query(sql, fields))
        })  
    },
    
    addNotificationComm(req, postId) {
        return new Promise(async (resolve) => {
            var sql ="INSERT INTO notifications SET ?";
            var fields = {
                user_id: req.user.id, 
                post_id: postId
            }
            resolve(db.query(sql, fields))
        })  
    },

    retrieveNotifications (req) {
        var date = new Date()
        var queryDate = date.getTime() - 2419200000 //Get notifications within 28 days
        return new Promise((resolve) => {
            var sql = "select notifications.id as notifId, post.id as postId, notifications.new_desc as newDescription, notifications.old_desc as oldDescription, \
            notifications.new_cost as newCost, notifications.old_cost as oldCost, users.id as editorId, users.first_name as firstName, \
            users.last_name as lastName, post.comment_text as commentDescription, post.classType as postType, post.post as postReference, \
            (select textbook.book_title from (select * from post) as selection inner join textbook on textbook.id = selection.textbook_id where selection.id = post.id) as postBookTitle, \
            (select selection.classType from (select * from post) as selection where selection.id = post.post) as postReferenceType, \
            (select users.id from (select * from post) as selection inner join users on selection.user = users.id where selection.id = post.post) as posterId,\
            (select users.first_name from (select * from post) as selection inner join users on selection.user = users.id where selection.id = post.post) as posterFirstName, \
            (select users.last_name from (select * from post) as selection inner join users on selection.user = users.id where selection.id = post.post) as posterLastName, \
            (select textbook.book_title from (select * from post) as selection inner join textbook on textbook.id = selection.textbook_id where selection.id = post.post) as postRefBookTitle\
            from post inner join users join notifications on users.id = post.user and post.id = notifications.post_id\
            where post.id IN (select post_id from notifications where notifications.post_id in (select post_id from postfollow where postfollow.user_id = ?)) or\
            post.post IN (select post_id from notifications where notifications.post_id in (select post_id from postfollow where postfollow.user_id = ?))  or \
            post.post IN (select id from post where post.id in (select post_id from postfollow where postfollow.user_id = ?)) or\
            post.id IN (select id from post where post.id in (select post_id from postfollow where postfollow.user_id = ?)) or\
            post.id in (select id from post where post.user = ? and (post.classType = 'Textbook' or post.classtype = 'Request'))\
            and post.post_time > ?\
            ORDER BY notifId";
            return resolve(db.query(sql, [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, queryDate]));
        })
    },
    
    retrieveNotification (postId) {
        return new Promise((resolve) => {
            var sql = "select notifications.id as notifId, post.id as postId, notifications.new_desc as newDescription, notifications.old_desc as oldDescription, \
            notifications.new_cost as newCost, notifications.old_cost as oldCost, users.id as editorId, users.first_name as firstName, \
            users.last_name as lastName, post.comment_text as commentDescription, post.classType as postType, post.post as postReference, \
            (select textbook.book_title from (select * from post) as selection inner join textbook on textbook.id = selection.textbook_id where selection.id = post.id) as postBookTitle, \
            (select selection.classType from (select * from post) as selection where selection.id = post.post) as postReferenceType, \
            (select users.id from (select * from post) as selection inner join users on selection.user = users.id where selection.id = post.post) as posterId,\
            (select users.first_name from (select * from post) as selection inner join users on selection.user = users.id where selection.id = post.post) as posterFirstName, \
            (select users.last_name from (select * from post) as selection inner join users on selection.user = users.id where selection.id = post.post) as posterLastName, \
            (select textbook.book_title from (select * from post) as selection inner join textbook on textbook.id = selection.textbook_id where selection.id = post.post) as postRefBookTitle\
            from post inner join users join notifications on users.id = post.user and post.id = notifications.post_id\
            where notifications.id = (select max(id) from notifications where notifications.post_id = ?)";
            return resolve(db.query(sql, postId));
        })
    },
    

    checkPostFollow(req, postId) {
        return new Promise((resolve) => {
            var sql = "select post_id from postfollow where postfollow.post_id = ? and postfollow.user_id = ?"
            return resolve(db.query(sql, [postId, req.user.id]));
        })
    },

    checkCourseFollow(req, courseId) {
        return new Promise(async (resolve) => {
            var sql1 = "select course_code as courseCode from course where id = ?"
            var sql2 = "select course_code from following where following.user_id = ? and following.course_code = ?"
            var courseCode = (await db.query(sql1, courseId))[0].courseCode
            return resolve(db.query(sql2, [req.user.id, courseCode]));
        })
    },

    removePostFollow(req, postId) {
        return new Promise((resolve) => {
            var sql = "delete from postfollow where user_id = ? and post_id = ?"
            return resolve(db.query(sql, [req.user.id, postId]));
        })
    },

    addPostFollow(req, postId) {
        return new Promise((resolve) => {
            var sql = "INSERT INTO postfollow SET ?";
            var fields = {
                user_id: req.user.id, 
                post_id: postId
            }
            resolve(db.query(sql, fields));
        })  
    },

    retrieveComments(id) {
        return new Promise((resolve) => {
            var sql = "select post.id as postId, post.post_time as postTime, post.views as postViews, \
            post.comment_text as comment, users.id as userId, users.first_name as firstName, users.last_name as lastName, \
            users.email as posterEmail\
            from post inner join users\
            on users.id = post.user\
            where post.classtype = ? and post.post= ?\
            order by postTime asc"
            return resolve(db.query(sql, ["Comment", id]));
        })
    },

    retrieveProfile(id) {
        return new Promise((resolve) => {
            var sql = 'SELECT email, first_name, middle_name, last_name, class_year FROM users WHERE id = ?'
            return resolve(db.query(sql, id));
        })
    },

    
    deletepost(id) {
        return new Promise(async (resolve) => {
            var sql1 = "DELETE FROM textbook WHERE book__post = ?"
            var sql2 = "DELETE FROM notifications WHERE post_id = ?"
            var sql3 = "DELETE FROM postfollow WHERE post_id = ?"
            var sql4 = "DELETE FROM post WHERE post.post = ?"
            var sql5 = "DELETE FROM post WHERE id = ?"
            await db.query(sql1, id)
            await db.query(sql2, id)
            await db.query(sql3, id)
            await db.query(sql4, id)
            resolve(db.query(sql5, id));
        })
    }, 


    retrievePostId() {
        return new Promise((resolve) => {
            var sql = "select max(id) as value from post"
            return resolve(db.query(sql));
        })
    },

    postComment(description, id, referencePost) {
        return new Promise((resolve) => {
            var commentDescription = description;
            var userId = id;
            var postTime = Date.now();
            var views = 0;
            var classType = "Comment";
            var sql = "INSERT INTO post SET ?";
            var fields = {
                post_time: postTime,
                user: userId, 
                views: views, 
                post: referencePost, 
                classtype: classType, 
                comment_text: commentDescription
            }
            resolve(db.query(sql, fields))
        })
    }, 

    postProfile(req) {
        return new Promise((resolve) => {
            var firstName = req.body.firstName;
            var lastName = req.body.lastName;
            var middle = req.body.middleInitial;
            var classyear = req.body.classyear;
            var sql = "UPDATE users SET first_name = ?, last_name = ?, middle_name = ?, class_year = ? WHERE id = ?"
            resolve(db.query(sql, [firstName, lastName, middle, classyear, req.user.id]))
        })
    },

    retrieveBookDescription(id) {
        return new Promise(async (resolve) => {
            var sql = 'select description_text from post where post.id = ?'
            var bookDesc = (await db.query(sql, id))[0].description_text;
            resolve(bookDesc)
        })
    }, 

    retrieveBookCost(id) {
        return new Promise(async (resolve) => {
            var sql = 'select cost from textbook where textbook.book__post = ?'
            var bookCost = (await db.query(sql, id))[0].cost;
            resolve(bookCost)
        })
    },

    retrieveRequestDescription(id) {
        return new Promise(async (resolve) => {
            var sql = 'select request_text from post where post.id = ?'
            var reqDesc = (await db.query(sql, id))[0].request_text;
            resolve(reqDesc)
        })
    }
};