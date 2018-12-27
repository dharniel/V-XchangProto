var socket = io();
var navOpen; 

$(() => {
    getNotifications()
    getUserName()
    getRequests()
    getCourses()
    getFollowsList()
    $('#searchBox').on('click', function(){
        $(this).removeClass('search-animation-pre')
        $(this).addClass('search-animation')
    })
    $('#searchBox').on('blur', function () {
        $(this).addClass('search-animation-pre')
        $(this).removeClass('search-animation')
    })
    $(function() {
        $(".swiper").swipe( {
            swipeRight:function(event, direction, distance, duration, fingerCount, fingerData) {
                openNav()
                navOpen = true;
            },
            swipeLeft:function(event, direction, distance, duration, fingerCount, fingerData) {
                if (navOpen) {
                    closeNav()
                } else {
                    getFollows()
                }
            }, 
            tap: function(event, direction, distance, duration, fingerCount, fingerData) {
                closeNav()
            }
        });
    });
})

socket.on('notifyPost', addNotificationSocket)
socket.on('notifyNew', showBlue)

async function showBlue(data) {
    var followVal = 0;
    if (data) {
        await $.get('http://'+window.location.host+'/checkcoursefollow/'+ data, async (result) => {
            followVal = result.length
        })
    }
    if (followVal) {
        setTimeout(() =>  {
            $("#body").addClass("notificationNewPost")
            setTimeout(() => {
                $("#body").removeClass("notificationNewPost")
            }, 3000)
        }, 0)
    }
}

async function addNotificationSocket(data) {
    var followVal = 0;
    if (data.postReference) {
        await $.get('http://'+window.location.host+'/checkpostfollow/'+ data.postReference, async (result) => {
            followVal = result.length
        })
    } else {
        await $.get('http://'+window.location.host+'/checkpostfollow/'+ data.postId, async (result) => {
            followVal = result.length
        })
    }
    await $.get('http://'+window.location.host+'/cleanCommentNotif/', data, async (result) => {
        data = result
    })
    if (followVal && data) {
        $("#notifications-toggle").removeClass("btn-dark")
        var newDesc, newCost;
        if (data.oldDescription == data.newDescription) {
            newDesc = `<span><i> same as old</i></span>`
        } else {
            newDesc = `<span><b><i><q>${data.newDescription}</q></i></b></span>`
        }

        if (data.oldCost == data.newCost) {
            newCost = `<span><i> same as old</i></span>`
        } else {
            newCost = `<span><b><i>$${data.newCost}</i></b></span>`
        }

        if (data.postType == "Textbook") {
            $("#body").addClass("notificationPostEdit")
            $("#notifications-toggle").addClass("btn-success")
            $("#notificationsList").prepend(
                `<li class="list-group-item" style="border-left: 5px solid #28a745; background-color: #D0F7DA;">
                    <b>${data.firstName} ${data.lastName}</b> edited the textbook -
                    <span><i><q>${data.postBookTitle}</q></i></span><br>
                    <a href="/viewbookpost/${data.postId}">View Textbook.</a>
                    <br><br>
                    <ul class="collapse collapse${data.notifId}" style="color: #28a745"" id="notif${data.notifId}">
                        <li><p>New Description is ${newDesc}.</p></li>
                        <li><p>New Cost is ${newCost}.</p></li>
                    </ul> 
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-sm btn-outline-dark" type="button" data-toggle="collapse" data-target=".collapse${data.notifId}" aria-expanded="false" aria-controls="notif${data.notifId}">
                            <i class="material-icons">unfold_more</i>
                        </button>
                    </div>
                </li>`
            )
        } else if (data.postType == "Request") {
            $("#body").addClass("notificationPostEdit")
            $("#notifications-toggle").addClass("btn-success")
            console.log(data)
            var reqDesc = data.oldDescription; 
            if (reqDesc.length > 40) {
                reqDesc = reqDesc.substring(0, 41) + "..."
            }
            $("#notificationsList").prepend(
                `<li class="list-group-item" style="border-left: 5px solid #28a745; background-color: #D0F7DA;">
                    <b>${data.firstName} ${data.lastName}</b> edited the request -
                    <span><i><q>${reqDesc}</q></i></span><br>
                    <a href="/viewbookrequest/${data.postId}">View Request.</a>
                    <br><br>
                    <ul class="collapse collapse${data.notifId}" style="color: #28a745" id="notif${data.notifId}">
                        <li><p>New Description is ${newDesc}.</p></li>
                    </ul> 
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-sm btn-outline-dark" type="button" data-toggle="collapse" data-target=".collapse${data.notifId}" aria-expanded="false" aria-controls="notif${data.notifId}">
                            <i class="material-icons">unfold_more</i>
                        </button>
                    </div>
                </li>`
            )
        } else if (data.postType == "Comment") {
            $("#body").addClass("notificationComment")
            $("#notifications-toggle").addClass("btn-danger")
            var apos = "'s"
            if (data.posterLastName == "") {apos = ""}
            if (data.postReferenceType == "Textbook") {
                $("#notificationsList").prepend(
                    `<li class="list-group-item" style="border-left: 5px solid red; background-color: #FF9696; font-size: 16px">
                        <b>${data.firstName} ${data.lastName}</b> commented on <b>${data.posterFirstName} ${data.posterLastName}${apos}</b> textbook - ${data.postRefBookTitle}.<br>
                        <a href="/viewbookpost/${data.postReference}">View Textbook.</a>
                        <br><br>
                        <ul class="collapse collapse${data.notifId}" style="color: red" id="notif${data.notifId}">
                            <li><p><span><i><q>${data.commentDescription}</q></i></span></p></li>
                        </ul> 
                        <div class="d-flex justify-content-end">
                            <button class="btn btn-sm btn-outline-dark" type="button" data-toggle="collapse" data-target=".collapse${data.notifId}" aria-expanded="false" aria-controls="notif${data.notifId}">
                                <i class="material-icons">unfold_more</i>
                            </button>
                        </div>
                    </li>`
                )
            } else if (data.postReferenceType == "Request") {
                $("#notificationsList").prepend(
                    `<li class="list-group-item" style="border-left: 5px solid red; background-color: #FF9696; font-size: 16px">
                        <b>${data.firstName} ${data.lastName}</b> commented on <b>${data.posterFirstName} ${data.posterLastName}${apos}</b> request.<br>
                        <a href="/viewbookrequest/${data.postReference}">View Request.</a>
                        <br><br>
                        <ul class="collapse collapse${data.notifId}" style="color: red" id="notif${data.notifId}">
                            <li><p><span><i><q>${data.commentDescription}</q></i></span></p></li>
                        </ul> 
                        <div class="d-flex justify-content-end">
                            <button class="btn btn-sm btn-outline-dark" type="button" data-toggle="collapse" data-target=".collapse${data.notifId}" aria-expanded="false" aria-controls="notif${data.notifId}">
                                <i class="material-icons">unfold_more</i>
                            </button>
                        </div>
                    </li>`
                )
            }
        }
    } 
}


function getNotifications() {
    return new Promise ((resolve) => {
        resolve ($.get('http://'+window.location.host+'/notifications', (data) => {
            if (data.length !== 0) {
                data.forEach(addNotification)
            } else {
                $("#notifications").append(
                    `<div>
                        You have no notifications
                    </div>
                    `
                )
            }
        }))
    })
}

function addNotification(data) {
    var newDesc, newCost;
    if (data.oldDescription == data.newDescription) {
        newDesc = `<span><i> same as old</i></span>`
    } else {
        newDesc = `<span><b><i><q>${data.newDescription}</q></i></b></span>`
    }

    if (data.oldCost == data.newCost) {
        newCost = `<span><i> same as old</i></span>`
    } else {
        newCost = `<span><b><i>$${data.newCost}</i></b></span>`
    }

    if (data.postType == "Textbook") {
        $("#notificationsList").prepend(
            `<li class="list-group-item" style="border-left: 5px solid #28a745">
                <b>${data.firstName} ${data.lastName}</b> edited the textbook -
                <span><i><q>${data.postBookTitle}</q></i></span><br>
                <a href="/viewbookpost/${data.postId}">View Textbook.</a>
                <br><br>
                <ul class="collapse collapse${data.notifId}" style="color: #28a745"" id="notif${data.notifId}">
                    <li><p>New Description is ${newDesc}.</p></li>
                    <li><p>New Cost is ${newCost}.</p></li>
                </ul> 
                <div class="d-flex justify-content-end">
                    <button class="btn btn-sm btn-outline-dark" type="button" data-toggle="collapse" data-target=".collapse${data.notifId}" aria-expanded="false" aria-controls="notif${data.notifId}">
                        <i class="material-icons">unfold_more</i>
                    </button>
                </div>
            </li>`
        )
    } else if (data.postType == "Request") {
        var reqDesc = data.oldDescription; 
        if (reqDesc.length > 40) {
            reqDesc = reqDesc.substring(0, 41) + "..."
        }
        $("#notificationsList").prepend(
            `<li class="list-group-item" style="border-left: 5px solid #28a745">
                <b>${data.firstName} ${data.lastName}</b> edited the request -
                <span><i><q>${reqDesc}</q></i></span><br>
                <a href="/viewbookrequest/${data.postId}">View Request.</a>
                <br><br>
                <ul class="collapse collapse${data.notifId}" style="color: #28a745" id="notif${data.notifId}">
                    <li><p>New Description is ${newDesc}.</p></li>
                </ul> 
                <div class="d-flex justify-content-end">
                    <button class="btn btn-sm btn-outline-dark" type="button" data-toggle="collapse" data-target=".collapse${data.notifId}" aria-expanded="false" aria-controls="notif${data.notifId}">
                        <i class="material-icons">unfold_more</i>
                    </button>
                </div>
            </li>`
        )
    } else if (data.postType == "Comment") {
        var apos = "'s"
            if (data.posterLastName == "") {apos = ""}
            if (data.postReferenceType == "Textbook") {
                $("#notificationsList").prepend(
                    `<li class="list-group-item" style="border-left: 5px solid red; font-size: 16px">
                        <b>${data.firstName} ${data.lastName}</b> commented on <b>${data.posterFirstName} ${data.posterLastName}${apos}</b> textbook - ${data.postRefBookTitle}.<br>
                        <a href="/viewbookpost/${data.postReference}">View Textbook.</a>
                        <br><br>
                        <ul class="collapse collapse${data.notifId}" style="color: red" id="notif${data.notifId}">
                            <li><p><span><i><q>${data.commentDescription}</q></i></span></p></li>
                        </ul> 
                        <div class="d-flex justify-content-end">
                            <button class="btn btn-sm btn-outline-dark" type="button" data-toggle="collapse" data-target=".collapse${data.notifId}" aria-expanded="false" aria-controls="notif${data.notifId}">
                                <i class="material-icons">unfold_more</i>
                            </button>
                        </div>
                    </li>`
                )
            } else if (data.postReferenceType == "Request") {
                $("#notificationsList").prepend(
                    `<li class="list-group-item" style="border-left: 5px solid red; font-size: 16px">
                        <b>${data.firstName} ${data.lastName}</b> commented on <b>${data.posterFirstName} ${data.posterLastName}${apos}</b> request.<br>
                        <a href="/viewbookrequest/${data.postReference}">View Request.</a>
                        <br><br>
                        <ul class="collapse collapse${data.notifId}" style="color: red" id="notif${data.notifId}">
                            <li><p><span><i><q>${data.commentDescription}</q></i></span></p></li>
                        </ul> 
                        <div class="d-flex justify-content-end">
                            <button class="btn btn-sm btn-outline-dark" type="button" data-toggle="collapse" data-target=".collapse${data.notifId}" aria-expanded="false" aria-controls="notif${data.notifId}">
                                <i class="material-icons">unfold_more</i>
                            </button>
                        </div>
                    </li>`
                )
            }
    }
}

function openNav() {
    $("#navbarNavAltMarkup").removeClass("show")
    $("#notifications-toggle").removeClass("btn-danger")
    $("#notifications-toggle").removeClass("btn-success")
    $("#body").removeClass("notificationPostEdit")
    $("#body").removeClass("notificationComment")
    $("#notifications-toggle").addClass("btn-dark")
    $("#addpost").hide()
    var width = window.innerWidth;
    if (width < 365) {
        document.getElementById("notifications").style.width = "300px";
    }
    else {
        document.getElementById("notifications").style.width = "365px";
    }
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

function closeNav() {
    $("#addpost").show()
    document.getElementById("notifications").style.width = "0";
    document.body.style.backgroundColor = "white";
}



//Display username of user 
function getUserName() {
    return new Promise ((resolve) => {
        resolve ($.get('http://'+window.location.host+'/fetchprofile', (data) => {
            $("#username").html(data)
        }))
    })
}

//Get all requests for courses that a user follows
function getRequests() {
    $.get('http://'+window.location.host+'/allrequests', async (data) => {
            $("#sortBtn").show();
            $("#followsButton").show();
            $("#viewSelect").show();
            $("#searchInfo").hide();
            document.getElementById("allrequests").innerHTML = "";
            $("#seeByCourse").removeClass("font-weight-bold")
            $("#seeAll").addClass("font-weight-bold")
            $("#allrequests").addClass("swiper")
            if (data.length !== 0) {
                await data.forEach(fetchStatus)
                data.forEach(addRequests)
            } else 
                $("#allrequests").append(
                    `<div class="text-center">
                        <h2 class="material-icons" style="font-size: 120px">
                        block
                        </h2>
                        <br>
                        <h3 class="font-weight-light">
                        There are no requests for the course(s) you have selected. To add more courses, go to <a href="/mycourses" style="text-decoration: none"><u>Preferences >> Manage Courses</u></a>
                        then return to 'Requests' 
                        </h3>
                    </div>`
            )
        })
}

function setFollowStatus(status, id) {
    return new Promise ((resolve) => {
        resolve (document.getElementById(id).innerHTML = status)
    })
}

function fetchStatus(post) {
        return new Promise ((resolve) => {
            var status;
            $.get('http://'+window.location.host+'/checkpostfollow/'+post.postId, async (data) => {
                if (data.length !== 0) {
                    status = "playlist_add_check"
                } else {
                    status = "playlist_add"
                }
                resolve (await this.setFollowStatus(status, post.postId))
            })
        })
}

function getCourses() {
    return new Promise ((resolve) => {
        resolve ($.get('http://'+window.location.host+'/courses', (data) => {
            data.forEach(addCourseOptions);
        }))
    })
    
}

//Add courses to textbook post form
function addCourseOptions(course) {
    return new Promise ((resolve) => {
        resolve ($(".allCoursesHere").append(`<option value=${course.id}>${course.course_code}  :  ${course.course_title}</option>`))
    })
    
}

//Add requests to page view
function addRequests(post){
    var meridian;
    var append = ""
    var appendTime = "" 
    var ptime = parseInt(post.postTime)
    parseTime = new Date(ptime)
    var date = parseTime.toLocaleDateString();
    var hours = parseTime.getHours()
    var minutes = parseTime.getMinutes()
    var newItem = ""
    if (post.postTime > (Date.now() - 12600000)) { //Posted within last 6 hours
        newItem = "New"
    }
    if (hours >= 12) {
        meridian = "PM"
    } else {
        meridian = "AM"
    }
    if (hours < 10) {
        append = "0"
    }
    if (minutes< 10) {
        appendTime = "0"
    }
    var time = append + hours + ":" + appendTime + minutes;
    if (hours >= 12) {
        meridian = "PM"
    } else {
        meridian = "AM"
    }
    $("#allrequests").append(
    `<div class="card book-pill mb-4">
            <div class="card-header d-flex">
            <span class="badge badge-success" style="margin-right: 7px">${newItem}</span>
              <span class="font-weight-bold">${post.postCourseCode} : ${post.postCourseTitle}</span>
            </div>
            <div class="card-body">
              <h5 class="card-text font-weight-normal">${post.postDescription}</h5>
              <h6 class="card-text font-weight-normal">by ${post.firstName} ${post.lastName} <i class="font-weight-light">at ${time} ${meridian}, ${date}</i></h6>
              
              <a href="/viewbookrequest/${post.postId}" class="btn btn-outline-success">View Request</a>
              <a id="${post.postId}" class="btn material-icons" onclick="processPostFollow(${post.postId})"></a>
            </div>
          </div>`
    )
}

//Sort visible requests by time in ascending order
function sortTimeAsc() {
    return new Promise ((resolve) => {
        resolve ($.get('http://'+window.location.host+'/sortTimeAscReq', async (data) => {
            document.getElementById("allrequests").innerHTML = "";
            if (data.length !== 0) {
                await data.forEach(fetchStatus)
                data.forEach(addRequests)
            } else {
                $("#allposts").append(
                    `<div class="text-center">
                        <h2 class="material-icons" style="font-size: 120px">
                        block
                        </h2>
                        <br>
                        <h3 class="font-weight-light">
                        There are no requests for the course(s) you have selected. To add more courses, go to <a href="/mycourses" style="text-decoration: none"><u>Preferences >> Manage Courses</u></a> then return to 'Requests'
                        </h3>
                    </div>`
                )
            }
        }))
    })
}

//Sort requests by time in descending order
function sortTimeDesc() {
    return new Promise ((resolve) => {
        resolve ($.get('http://'+window.location.host+'/sortTimeDescReq', async (data) => {
            document.getElementById("allrequests").innerHTML = "";
            if (data.length !== 0) {
                await data.forEach(fetchStatus)
                data.forEach(addRequests)
            } else {
                $("#allposts").append(
                    `<div class="text-center">
                        <h2 class="material-icons" style="font-size: 120px">
                        block
                        </h2>
                        <br>
                        <h3 class="font-weight-light">
                        There are no requests for the course(s) you have selected. To add more courses, go to <a href="/mycourses" style="text-decoration: none"><u>Preferences >> Manage Courses</u></a> then return to 'Requests'
                        </h3>
                    </div>`
                )
            }
        }))
    })
}

//Sort request by course code in ascending order
function sortCourseAsc() {
    return new Promise ((resolve) => {
        resolve ($.get('http://'+window.location.host+'/sortCourseAscReq', async (data) => {
            document.getElementById("allrequests").innerHTML = "";
            if (data.length !== 0) {
                await data.forEach(fetchStatus)
                data.forEach(addRequests)
            } else {
                $("#allposts").append(
                    `<div class="text-center">
                        <h2 class="material-icons" style="font-size: 120px">
                        block
                        </h2>
                        <br>
                        <h3 class="font-weight-light">
                        There are no requests for the course(s) you have selected. To add more courses, go to <a href="/mycourses" style="text-decoration: none"><u>Preferences >> Manage Courses</u></a> then return to 'Requests'
                        </h3>
                    </div>`
                )
            }
        }))
    })
}

//Sort requests by course code in descending order
function sortCourseDesc() {
    return new Promise ((resolve) => {
        resolve ($.get('http://'+window.location.host+'/sortCourseDescReq', async (data) => {
            document.getElementById("allrequests").innerHTML = "";
            if (data.length !== 0) {
                await data.forEach(fetchStatus)
                data.forEach(addRequests)
            } else {
                $("#allposts").append(
                    `<div class="text-center">
                        <h2 class="material-icons" style="font-size: 120px">
                        block
                        </h2>
                        <br>
                        <h3 class="font-weight-light">
                        There are no requests for the course(s) you have selected. To add more courses, go to <a href="/mycourses" style="text-decoration: none"><u>Preferences >> Manage Courses</u></a> then return to 'Requests'
                        </h3>
                    </div>`
                )
            }
        }))
    })
}

//See requests for specific course
function viewForCourses() {
    var name = $("#coursepicked").val()
    getRequestsForCourse(name)
    $("#coursepicked").val('')
}

//Get requests for a course from database
function getRequestsForCourse(name) {
    return new Promise ((resolve) => {
        resolve ($.get('http://'+window.location.host+'/requestsforcourse/'+name, async (data) => {
            document.getElementById("allrequestsforcourse").innerHTML = "";
            if (data.length !== 0) {
                await data.forEach(fetchStatus)
                data.forEach(addRequestsForCourse)
                data.forEach(fetchStatus)
            } else {
                $("#allrequestsforcourse").append(
                    `<div class="text-center">
                        <h2 class="material-icons" style="font-size: 120px">
                        block
                        </h2>
                        <br>
                        <h3 class="font-weight-light">
                        There are no requests for the course you have selected. To add more courses, go to <a href="/mycourses" style="text-decoration: none"><u>Preferences >> Manage Courses</u></a> then return to 'Requests'
                        </h3>
                    </div>`
                )
            }
        }))
    })
    
}

//Add requests for a specific course to view
function addRequestsForCourse(post) {
    var meridian;
    var append = ""
    var appendTime = "" 
    var ptime = parseInt(post.postTime)
    parseTime = new Date(ptime)
    var date = parseTime.toLocaleDateString();
    var hours = parseTime.getHours()
    var minutes = parseTime.getMinutes()
    var newItem = ""
    if (post.postTime > (Date.now() - 12600000)) { //Posted within last 6 hours
        newItem = "New"
    }
    if (hours >= 12) {
        meridian = "PM"
    } else {
        meridian = "AM"
    }
    if (hours < 10) {
        append = "0"
    }
    if (minutes< 10) {
        appendTime = "0"
    }
    var time = append + hours + ":" + appendTime + minutes;
    if (hours >= 12) {
        meridian = "PM"
    } else {
        meridian = "AM"
    }
    $("#allrequestsforcourse").append(
        `<div class="card book-pill mb-4">
                <div class="card-header d-flex">
                    <span class="badge badge-success" style="margin-right: 7px">${newItem}</span>
                  <span class="font-weight-bold">${post.postCourseCode} : ${post.postCourseTitle}</span>
                </div>
                <div class="card-body">
                  <h5 class="card-text font-weight-normal">${post.postDescription}</h5>
                  <h6 class="card-text font-weight-normal">by ${post.firstName} ${post.lastName} <i class="font-weight-light">at ${time} ${meridian}, ${date}</i></h6>
                  <br>
                  <a href="/viewbookrequest/${post.postId}" class="btn btn-outline-success">View Request</a>
                  <a id="${post.postId}" class="btn material-icons" onclick="processPostFollow(${post.postId})"></a>
                </div>
              </div>`
        )
}


function setFollowStatus(status, id) {
    return new Promise ((resolve) => {
        resolve (document.getElementById(id).innerHTML = status)
    })
}

function fetchStatus(post) {
        return new Promise ((resolve) => {
            var status;
            $.get('http://'+window.location.host+'/checkpostfollow/'+post.postId, async (data) => {
                if (data.length !== 0) {
                    status = "playlist_add_check"
                } else {
                    status = "playlist_add"
                }
                resolve (await this.setFollowStatus(status, post.postId))
            })
        })
}

function processPostFollow(postId) {
    return new Promise (async (resolve) => {
        if ($("#"+postId).html() === "playlist_add_check") {
            $("#"+postId).html("playlist_add")
            setTimeout(() =>  {
                $("#body").append(
                    `<div id="alertAdd" class="alert alert-danger fade show" style="position: fixed;top: 95%;left: 50%; z-index: 2; transform: translate(-50%, -50%);"role="alert">
                        Request removed.
                    </div>`
                )
                setTimeout(() => {
                    $('#alertAdd').remove()
                }, 1500)
            }, 0)
            resolve (await $.post("/removepostfollow", {"postId" : postId}))
        } else if ($("#"+postId).html() === "playlist_add") {
            $("#"+postId).html("playlist_add_check")
            setTimeout(() =>  {
                $("#body").append(
                    `<div id="alertAdd" class="alert alert-success fade show" style="position: fixed;top: 95%;left: 50%; z-index: 2; transform: translate(-50%, -50%);"role="alert">
                        Request saved.
                    </div>`
                )
                setTimeout(() => {
                    $('#alertAdd').remove()
                }, 1500)
            }, 0)
            resolve (await $.post("/addpostfollow", {"postId" : postId}))
        }
    })
}
//Get courses user follows
function getFollows() {
    return new Promise ((resolve) => {
        resolve($.get('http://'+window.location.host+'/coursesFollowed', (data) => {  
            $("#sortBtn").hide();
            $("#followsButton").hide();
            document.getElementById("allrequests").innerHTML = "";
            $("#seeAll").removeClass("font-weight-bold")
            $("#seeAll").addClass("font-weight-normal")
            $("#seeByCourse").addClass('font-weight-bold')
            $("#allrequests").removeClass("swiper").unbind('mousedown').unbind('touchcancel')
            if (data.length !== 0) {
                $("#allrequests").append(`
                <input class="form-control" list="follows" id="coursepicked" placeholder="Enter Course Code or Course Name">
                <datalist id="follows">
                </datalist>
                <span><button onclick='viewForCourses()' class="btn btn-outline-dark mt-2">VIEW</button></span>
                <br>
                <br>
                <div class="home row" id="allrequestsforcourse">
                    <h3 class="font-weight-light">
                        Select a course from the list to view requests
                    </h3>
                </div>
                `)
                data.forEach(addFollows);
            }  else {
                $("#allrequests").append(
                    `<div class="text-center">
                        <h2 class="material-icons" style="font-size: 120px">
                        block
                        </h2>
                        <br>
                        <h3 class="font-weight-light">
                        There are no requests for the course(s) you have selected. To add more courses, go to <a href="/mycourses" style="text-decoration: none"><u>Preferences >> Manage Courses</u></a> then return to 'Requests'
                        </h3>
                    </div>`
                )
            }
        }))
    })
}


//Add courses user follows to datalist
function addFollows(course) {
    $("#follows").append(`<option value=${course.course_code}>${course.course_title}</option>`)
}

function getFollowsList() {
    return new Promise ((resolve) => {
        resolve ($.get('http://'+window.location.host+'/coursesFollowed', (data) => {
            data.forEach(addFollowList)
        }))
    })
}

function addFollowList(course) {
    $("#coursesFollowList").append(`<li><h6>${course.course_code} : ${course.course_title}</h6></li><hr>`)
}

//Get value of searchbox
function getSearchItem() {
    $("#navbarNavAltMarkup").removeClass("show")
    var name = $("#searchBox").val()
    search(name)
}

//Searches the database for requests containing searchbox value
function search(name) {
    return new Promise ((resolve) => {
        resolve ($.get('http://'+window.location.host+'/requestsSearch/'+name, async (data) => {
            $("#viewsSelect").hide();
            $("#sortBtn").hide();
            $("#followsButton").hide();
            document.getElementById("searchInfo").removeAttribute("hidden");
            $("#searchInfo").show();
            document.getElementById("allrequests").innerHTML = ""
            if (data.length !== 0) {
                await data.forEach(fetchStatus)
                data.forEach(addRequestsForCourse)
                data.forEach(addRequests)
            } else {
                $("#allrequestsforcourse").append(
                    `<div class="text-center">
                        <h2 class="material-icons" style="font-size: 120px">
                        block
                        </h2>
                        <br>
                        <h3 class="font-weight-light">
                        No results. 
                        </h3>
                    </div>`
                )
                $("#allrequests").append(
                    `<div class="text-center">
                        <h2 class="material-icons" style="font-size: 120px">
                        block
                        </h2>
                        <br>
                        <h3 class="font-weight-light">
                        No results. 
                        </h3>
                    </div>`
                )
            }
        }))
    })
}