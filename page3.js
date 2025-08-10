// Role selection buttons
document.getElementById('rapperBtn').addEventListener('click', () => {
    document.getElementById('rapperForm').classList.remove('hidden');
    document.getElementById('audienceForm').classList.add('hidden');
    document.getElementById('votingSection').classList.add('hidden');
});

document.getElementById('audienceBtn').addEventListener('click', () => {
    document.getElementById('audienceForm').classList.remove('hidden');
    document.getElementById('rapperForm').classList.add('hidden');
    document.getElementById('votingSection').classList.remove('hidden'); // <-- Ab direct show hoga
});

// Form submit hone ke baad voting section dikhana
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.classList.add('hidden');
        document.getElementById('votingSection').classList.remove('hidden');
    });
});

// Voting button color change (Event Delegation)
document.addEventListener('click', (e) => {
    if (e.target.matches('.vote-buttons button')) {
        const btn = e.target;
        btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
});
