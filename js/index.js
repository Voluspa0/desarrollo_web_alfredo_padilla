let addActivityBtn = document.getElementById("addActivityBtn");
let listActivityBtn = document.getElementById("listActivityBtn");
let statsBtn = document.getElementById("statsBtn");




addActivityBtn.addEventListener("click", function() {
    window.location.href = "../html/add_activity.html";
});
listActivityBtn.addEventListener("click", function() {
    window.location.href = "../html/list_activity.html";
}); 
statsBtn.addEventListener("click", function() {
    window.location.href = "../html/stats.html";
});    