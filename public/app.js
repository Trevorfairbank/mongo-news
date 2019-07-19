// // Grab the articles as a json
// $.getJSON("/articles", function (data) {
//     // For each one
//     for (var i = 0; i < data.length; i++) {
//         // Display the apropos information on the page
//         $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
//     }
// });


// Whenever someone clicks a ScrapeNEW tag
$(document).on("click", ".scrape-new", function () {
    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/scrape"
    })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);
            location.reload();
        });
});

// Whenever someone clicks clear button
$(document).on("click", ".clear", function () {
    // Now make an ajax call for the Article
    $.ajax({
        method: "PUT",
        url: "/clear"
    })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);
            location.reload();
        });
});

// When you click the Save article button
$(document).on("click", "#saveArticle", function () {
let thisId = $(this).attr("data-id");

    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId,
    })
    .then(function(data){
        console.log(data);
        location.reload();
    })
});

// When you click the Save article button
$(document).on("click", "#removeArticle", function () {
    let thisId = $(this).attr("data-id");
    
        $.ajax({
            method: "POST",
            url: "/articles/remove/" + thisId,
        })
        .then(function(data){
            console.log(data);
            location.reload();
        })
    });

// // Grab the id associated with the article from the submit button
// var thisId = $(this).attr("data-id");

// // Run a POST request to change the note, using what's entered in the inputs
// $.ajax({
//   method: "POST",
//   url: "/articles/" + thisId,
//   data: {
//     // Value taken from title input
//     title: $("#titleinput").val(),
//     // Value taken from note textarea
//     body: $("#bodyinput").val()
//   }
// })
//   // With that done
//   .then(function(data) {
//     // Log the response
//     console.log(data);
//     // Empty the notes section
//     $("#notes").empty();
//   });

// // Also, remove the values entered in the input and textarea for note entry
// $("#titleinput").val("");
// $("#bodyinput").val("");