// Loader hide after 2 sec
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").style.display = "none";
  }, 2000);
});

// Cursor change on text select
document.addEventListener("mousemove", (e) => {
  if (window.getSelection().toString().length > 0) {
    document.body.style.cursor = "url('Cursorstext.png'), text";
  } else {
    document.body.style.cursor = "url('Cursors.png'), auto";
  }
});
