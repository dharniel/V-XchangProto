var socket = io();

$(async () => {
    await getPostDetails()
    getCommentDetails()
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
    $('#commentform').on('submit', (e) => {
        e.preventDefault()
        var description = $('#usercomment').val()
        $.post('/comment', {"commentDescription" : description})
        $('#usercomment').val("")
    })
})

socket.on('commentPosted', renderCommentsSocket)
socket.on('notifyPost', addNotificationSocket)
socket.on('notifyNew', showBlue)

async function renderCommentsSocket(post) {
    await $.get('http://'+window.location.host+'/cleanCommentPost/', post, async (result) => {
        console.log(result)
        renderComments(result[0])
    })
}

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


//Gets details of a post from database
function getPostDetails() {
    return new Promise ((resolve) => {
        $.get('http://'+window.location.host+'/viewbookpostdeets', (data) => {
            fetchStatus(data)
            document.title = data.postBookTitle
            resolve(renderPost(data))
        })
    })
}

//Gets comments for a book post from database
function getCommentDetails() {
    $.get('http://'+window.location.host+'/viewbookpostcomments', (data) => {
        data.forEach(renderComments)
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
                }, 1500)
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

//Displays book post
function renderPost(post){
    console.log("Render Post:")
    console.log(post)
    $("#allcontainer").append(
    `<div class="card-header d-flex">
        <span class="font-weight-bold mr-auto">${post.firstName} ${post.lastName}</span>
        <span class="text-success font-weight-info">${post.postViews} view(s)</span>
    </div>

    <div class="card-body" id="textbookscontainer">
        <div id="textbook" class="card book-pill mb-4">
            <div class="card-header d-flex bg-dark">
                <span class="font-weight-bold mr-auto text-light">${post.postCourseCode} : ${post.postCourseTitle}</span>
                <span class="text-success font-weight-bold">$${post.postBookCost}</span>
                <span id="${post.postId}" class="text-light pt-0 btn material-icons" onclick="processPostFollow(${post.postId})"></span>
            </div>
            <div class="card-body">
            <h5 class="card-title">${post.postBookTitle}</h5>
            <p class="card-text">${post.postDescription}</p>
            </div>
        </div>
    </div>
    
    <hr class="headerhr">
    <h6 class="card-body text-left text-dark font-italic font-weight-bold mb-3 pb-0 pt-0">COMMENTS</h6>`
    )
}

//Displays comments for book post. 
function renderComments(post){
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
        if(hours > 12) {
            hours = hours % 12
        }
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
    $("#allcontainer").append(
    `<div class="pl-4 pr-4">
        <div class="row pl-3 pr-3">
            <span class="font-weight-normal mr-auto">${post.firstName} ${post.lastName}</span>
            <h6 class="text-info font-weight-normal"><small>${time} ${meridian}, ${date}</small></h6>
        </div>
        <div class="font-weight-light">${post.comment}</div>
        <hr>
    </div>`
    )
}

