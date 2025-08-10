document.getElementById('rapperBtn').addEventListener('click', () => {
    document.getElementById('rapperForm').classList.remove('hidden');
    document.getElementById('audienceForm').classList.add('hidden');
    document.getElementById('votingSection').classList.add('hidden');
});

document.getElementById('audienceBtn').addEventListener('click', () => {
    document.getElementById('audienceForm').classList.remove('hidden');
    document.getElementById('rapperForm').classList.add('hidden');
    document.getElementById('votingSection').classList.add('hidden');
});

// Example: After form submit, show voting section
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.classList.add('hidden');
        document.getElementById('votingSection').classList.remove('hidden');
    });
});

// Voting button color change
document.querySelectorAll('.vote-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

