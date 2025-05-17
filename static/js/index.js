let addActivityBtn = document.getElementById("addActivityBtn");
let listActivityBtn = document.getElementById("listActivityBtn");
let statsBtn = document.getElementById("statsBtn");




addActivityBtn.addEventListener("click", function() {
    window.location.href = "/add_activity";
});
listActivityBtn.addEventListener("click", function() {
    window.location.href = "/list_activity";
}); 
statsBtn.addEventListener("click", function() {
    window.location.href = "/stats";
});    