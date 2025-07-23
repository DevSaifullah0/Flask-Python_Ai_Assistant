document.addEventListener('DOMContentLoaded', () => {
  // Helper: Add fade-in animation
  function fadeIn(element) {
    element.style.opacity = 0;
    element.style.transition = 'opacity 0.6s ease-in-out';
    requestAnimationFrame(() => {
      element.style.opacity = 1;
    });
  }

  // ========== SIGNUP PAGE ==========
  const signupForm = document.querySelector('form[action="/signup"]');
  if (signupForm) {
    const container = document.querySelector('.signup-container');
    if (container) fadeIn(container);

    signupForm.addEventListener('submit', (e) => {
      const name = signupForm.querySelector('input[name="name"]').value.trim();
      const email = signupForm.querySelector('input[name="email"]').value.trim();
      const password = signupForm.querySelector('input[name="password"]').value.trim();

      if (!name || !email || !password) {
        alert("Please fill all fields.");
        e.preventDefault();
      } else if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        e.preventDefault();
      }
    });
  }

  // ========== LOGIN PAGE ==========
  const loginForm = document.querySelector('form[action="/login"]');
  if (loginForm) {
    const container = document.querySelector('.login-container');
    if (container) fadeIn(container);

    loginForm.addEventListener('submit', (e) => {
      const email = loginForm.querySelector('input[name="email"]').value.trim();
      const password = loginForm.querySelector('input[name="password"]').value.trim();

      if (!email || !password) {
        alert("Please enter email and password.");
        e.preventDefault();
      }
    });
  }

  // ========== CHATBOT PAGE ==========
  const input = document.getElementById('userInput');
  const chatBox = document.querySelector('.chat-messages');

  if (input && chatBox) {
    input.focus(); // ✅ Focus on input when page loads

    window.sendMessage = async function () {
      const prompt = input.value.trim();
      if (!prompt) return;

      appendMessage('user', prompt);
      input.value = '';

      try {
        const res = await fetch('/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        const data = await res.json();
        appendMessage('bot', data.response);
      } catch (error) {
        appendMessage('bot', 'Something went wrong. Please try again.');
      }
    };

    function appendMessage(type, message) {
      const msgDiv = document.createElement('div');
      msgDiv.classList.add('message', type);
      msgDiv.innerHTML = `<span class="sender">${type === 'user' ? '🧑‍💬 You' : '🤖 Saifullah'}:</span> <span class="text">${message}</span>`;
      msgDiv.style.opacity = 0;
      msgDiv.style.transform = 'translateY(10px)';
      msgDiv.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      chatBox.appendChild(msgDiv);

      requestAnimationFrame(() => {
        msgDiv.style.opacity = 1;
        msgDiv.style.transform = 'translateY(0)';
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }
});
