
//frontend without backend only store in localstorage 

const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        let lowerCaseLetters = /[a-z]/g;
        let upperCaseLetters = /[A-Z]/g;
        let numbers = /0-[9]/g;

        let users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email);

        let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/g;

        if (user) {
            alert('Email already registered');
            return;
        } else {
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            } else if (!email.match(validRegex)) {
                alert('Email is not valid');
                return;
            } else if (password.length > 8) {
                alert('Password must be a maximum of 8 characters');
                return;
            } else if (!password.match(numbers)) {
                alert('Password must contain at least 1 number');
                return;
            } else if (!password.match(upperCaseLetters)) {
                alert('Password must contain at least 1 uppercase letter');
                return;
            } else if (!password.match(lowerCaseLetters)) {
                alert('Password must contain at least 1 lowercase letter');
                return;
            } else {
                users.push({ email, password });
                localStorage.setItem('users', JSON.stringify(users));
                // document.cookie = 'users=' + JSON.stringify(users) + ';path=/';
                window.location.href = 'home.html';
            }
        }
    });
}



const loginuser = document.getElementById('loginForm')
if (loginuser) {
    loginuser.addEventListener('submit', (e) => {
        e.preventDefault()
        const userdetail = JSON.parse(localStorage.getItem('users')) || [];

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const user = userdetail.find(user => user.email === email && user.password === password);
        if (!user) {
            alert('password or email is not correct')
        } else {
            window.location.href = 'home.html';
        }
    });
}

const users = document.getElementById('userList')
if (users) {
    const userdetail = JSON.parse(localStorage.getItem('users')) || [];
    users.innerHTML = userdetail.map(user => `<li>${user.email} ${user.password}</li>`).join('');
}