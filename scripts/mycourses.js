var socket = io();
var courses, currentCourseTitle, allCourses;

$(async () => {
    console.log(allCourses)
    await getNotifications()
    await getCourses()
    console.log(allCourses.slice(0, 10))
    await getFollows()
    $(function() {
        $(".swiper").swipe( {
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
    $(".course-selector").on('submit', (e) => {
        e.preventDefault();
        processAddition();
        $("#selectedCourse").val('')
        $('#freedom').val("Me")
    })
    $('#selectedCourse').on('input', () => {
        var input = $('#selectedCourse').val()
        if ((input !== "") && (input.length > 3)) {
            $('#courses').html('')
            var output = allCourses.filter(elt => elt.course_code.toLowerCase().includes(input.toLowerCase()) || elt.course_title.toLowerCase().includes(input.toLowerCase()))
            output.forEach(addCourseOptions)
        }
    })
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

//Get all courses from database
function getCourses() {
    return new Promise ((resolve) => {
        resolve ($.get('http://'+window.location.host+'/courses', (data) => { 
            allCourses = data;
            //data.forEach(addCourseOptions);
        }))
    })
}

//Add these courses to list of courses user can choose to follow.
function addCourseOptions(course) {
    $("#courses").append(`<option value=${course.course_code}>${course.course_title}</option>`)
}

//Get courses user follows.
function getFollows() {
    return new Promise ((resolve) => {
        resolve($.get('http://'+window.location.host+'/coursesFollowed', (data) => {    
            if (data.length !== 0) {
                courses = data;
                data.forEach(addFollows);
            } else {
                courses = []
                $("#res").append(`<div class="text-center" id="nocourses">
                <h2 class="material-icons" style="font-size: 120px">
                block
                </h2>
                <br>
                <h3 class="font-weight-light">
                No courses followed. 
                </h3>
            </div>`)
            }
        }))
    })
}

//Add courses the user follows to the view.
function addFollows(follow) {
    $("#courseListItem").append(`
    <li class="list-group-item d-flex" id=${follow.course_code}>
    <span class="mr-auto">${follow.course_code} : ${follow.course_title}</span>
    <span><a href="#"><button class="btn btn-sm btn-outline-dark justify-content-end" onclick="processRemoval('${follow.course_code}')"><i class="material-icons">delete_outline</i></button></a></span>
    </li>
    `)
}


function processRemoval(coursecode) {
    processDelete(coursecode)
    $.post("/removeFromFollow", {"courseCode": coursecode})
}

function processAddition() {
    var coursecode = $("#selectedCourse").val();
    currentCourseTitle = $(`#courses option[value='${coursecode}']`).text()
    var present = courses.find((element) => {
        return element.course_code === coursecode
    })
    if (!present) {
        processAdd(coursecode)
        $.post("/addFollow", {"courseCode": coursecode})
    } else {
        $("#body").addClass("opctyDown")
        $("#body").append(
            `<div class="alert alert-warning alert-dismissible fade show" style="position: fixed;top: 50%;left: 50%; z-index: 2; transform: translate(-50%, -50%);"role="alert">
                You have already added this course.
                <button type="button" class="close" data-dismiss="alert" aria-label="Close" onclick="clearopacity()">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>`
        )
    }
}

function processDelete(coursecode) {
    var eltIndex = courses.findIndex((element) => {
        return element.course_code === coursecode
    })
    courses.splice(eltIndex, 1)
    $("#"+coursecode).remove()
    setTimeout(() =>  {
        $("#body").append(
            `<div id="alertDel" class="alert alert-danger fade show" style="position: fixed;top: 95%;left: 50%; z-index: 2; transform: translate(-50%, -50%);"role="alert">
                <strong>${coursecode}</strong> removed.
            </div>`
        )
        setTimeout(() => {
            $('#alertDel').remove()
        }, 1500)
    }, 0)
}

function processAdd(courseCode) {
    courses.push({course_code: courseCode, course_title: currentCourseTitle})
    $('#nocourses').html("")
    $("#courseListItem").append(`
    <li class="list-group-item d-flex" id=${courseCode}>
    <span class="mr-auto">${courseCode} : ${currentCourseTitle}</span>
    <span><a href="#"><button class="btn btn-sm btn-outline-dark justify-content-end" onclick="processRemoval('${courseCode}')"><i class="material-icons">delete_outline</i></button></a></span>
    </li>
    `)
    setTimeout(() =>  {
        $("#body").append(
            `<div id="alertAdd" class="alert alert-success fade show" style="position: fixed;top: 95%;left: 50%; z-index: 2; transform: translate(-50%, -50%);"role="alert">
                <strong>${courseCode}</strong> added.
            </div>`
        )
        setTimeout(() => {
            $('#alertAdd').remove()
        }, 1500)
    }, 0)
}

function clearopacity() {
    $("#body").removeClass("opctyDown")
}
