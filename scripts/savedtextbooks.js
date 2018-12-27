var socket = io();

$(() => {
    getPosts()
    getNotifications()
    $(function() {
        $("#main").swipe( {
            swipeRight:function(event, direction, distance, duration, fingerCount, fingerData) {
                openNav()
            },
            swipeLeft:function(event, direction, distance, duration, fingerCount, fingerData) {
                closeNav()
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
    document.getElementById("notifications").style.width = "0";
    document.body.style.backgroundColor = "white";
}


//Get all textbook posts the user has made
function getPosts() {
    $.get('http://'+window.location.host+'/gettextbookfollow', (data) => {
        if (data.length !== 0) {
            data.forEach(addPosts);
            data.forEach(fetchStatus)
        } else {
            $("#allmybooks").append(
                `<div class="text-center">
                    <h2 class="material-icons" style="font-size: 120px">
                    block
                    </h2>
                    <br>
                    <h3 class="font-weight-light">
                    You have no saved book posts.
                    </h3>
                </div>`
            )
        }
    })
}

//Add these posts to the html view
function addPosts(post){
    var meridian;
    var append = ""
    var appendTime = "" 
    var ptime = parseInt(post.postTime)
    parseTime = new Date(ptime)
    var date = parseTime.toLocaleDateString();
    var hours = parseTime.getHours()
    var minutes = parseTime.getMinutes()
    if (hours >= 12) {
        meridian = "PM"
    } else {
        meridian = "AM"
    }
    if (hours< 10) {
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
    
    $("#allmybooks").append(
    `<div class="card book-pill mb-4">
        <div class="card-header d-flex">
        <span class="font-weight-bold mr-auto">${post.postCourseCode} : ${post.postCourseTitle}</span>
        </div>
        <div class="card-body">
        <h5 class="card-title">${post.postBookTitle}</h5>
        <h6 class="card-text font-weight-normal">by ${post.firstName} ${post.lastName} <i class="font-weight-light">at ${time} ${meridian}, ${date}</i></h6>
        <a href="/viewbookpost/${post.postId}" class="btn btn-outline-success">View Post</a>
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
                        Textbook removed.
                    </div>`
                )
                setTimeout(() => {
                    $('#alertAdd').remove()
                },1500)
            }, 0)
            resolve (await $.post("/removepostfollow", {"postId" : postId}))
        } else if ($("#"+postId).html() === "playlist_add") {
            $("#"+postId).html("playlist_add_check")
            setTimeout(() =>  {
                $("#body").append(
                    `<div id="alertAdd" class="alert alert-success fade show" style="position: fixed;top: 95%;left: 50%; z-index: 2; transform: translate(-50%, -50%);"role="alert">
                        Textbook saved.
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
