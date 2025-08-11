// Future customization ke liye JS
// Example: Rap click karne par details update karna

document.querySelectorAll('.rap-item').forEach(item => {
    item.addEventListener('click', () => {
        alert("Rap clicked: " + item.querySelector('h2').textContent);
    });
});
