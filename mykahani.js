// Chapter data
const chapters = {
  1: {
    title: "Chapter 1 : Shuruwaat",
    text: "Dowry ek samay ki baat hai... yeh chapter 1 ka pura kahani ka content."
  },
  2: {
    title: "Chapter 2 : Sangharsh",
    text: "Yeh chapter 2 ka text hoga... struggles aur kahani aage badhegi."
  },
  3: {
    title: "Chapter 3 : Nayi Soch",
    text: "Chapter 3 ka text yahan likh sakte ho... freedom aur naye decisions."
  }
4: {
    title: "Chapter 4 : Nayi Soch",
    text: "Chapter 4 ka text yahan likh sakte ho... freedom aur naye decisions."
  }

5: {
    title: "Chapter 5 : Nayi Soch",
    text: "Chapter 5 ka text yahan likh sakte ho... freedom aur naye decisions."
  }
6: {
    title: "Chapter 6 : Nayi Soch",
    text: "Chapter 6 ka text yahan likh sakte ho... freedom aur naye decisions."
  }
7: {
    title: "Chapter 7 : Nayi Soch",
    text: "Chapter 7 ka text yahan likh sakte ho... freedom aur naye decisions."
  }
8: {
    title: "Chapter 8 : Nayi Soch",
    text: "Chapter 8 ka text yahan likh sakte ho... freedom aur naye decisions."
  }
9: {
    title: "Chapter 9 : Nayi Soch",
    text: "Chapter 9 ka text yahan likh sakte ho... freedom aur naye decisions."
  }
10: {
    title: "Chapter 10 : Nayi Soch",
    text: "Chapter 10 ka text yahan likh sakte ho... freedom aur naye decisions."
  }







  
};

// Card click → Show Chapter
document.querySelectorAll('.story-card').forEach(card => {
  card.addEventListener('click', () => {
    const chapNum = card.getAttribute('data-chapter');
    if (chapNum && chapters[chapNum]) {
      document.getElementById('chapter-title').innerText = chapters[chapNum].title;
      document.getElementById('chapter-text').innerText = chapters[chapNum].text;
      document.getElementById('chapter-content').style.display = "block";
    }
  });
});

// Add Card click functionality
document.querySelectorAll('.add-card').forEach(card => {
  card.addEventListener('click', () => {
    alert("Yahaan se naya chapter/poster add hoga!");
  });
});

// Next Button functionality
document.querySelector('.next-btn').addEventListener('click', () => {
  alert("Next cards dikhane ka option implement hoga yahan!");
});
