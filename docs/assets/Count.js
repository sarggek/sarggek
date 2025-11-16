let viewsCount = document.getElementById('viewsCount');

function incrementViews() {
    let currentViews = parseInt(viewsCount.innerText);
    viewsCount.innerText = currentViews + 10;
}

// Har 1 second (1000 milliseconds) ke baad views count 10 se increment karega
setInterval(incrementViews, 1000);
