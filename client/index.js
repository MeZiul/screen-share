window.onload = function () {
    window.electronAPI.onUuid((data) => {
        document.getElementById("code").innerHTML = data;
    });
};

function startShare() {
    window.electronAPI.startShare();
    document.getElementById("start").style.display = "none";
    document.getElementById("stop").style.display = "block";
}

function stopShare() {
    window.electronAPI.stopShare();
    document.getElementById("stop").style.display = "none";
    document.getElementById("start").style.display = "block";
    document.getElementById("code").innerHTML = "";
}