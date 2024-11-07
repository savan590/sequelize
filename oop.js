class Vehicle {
    constructor(type) {
        this.type = type;
    }

    startEngine() {
        console.log("Starting engine of", this.type);
    }
}

class Car extends Vehicle {
    constructor(company, model) {
        super('car');
        this.company = company;
        this.model = model;
        this.engineStarted = false;
    }

    startEngine() {
        this.engineStarted = true;
        console.log(`${this.company} ${this.model}'s engine started.`);
    }

    stopEngine() {
        this.engineStarted = false;
        console.log(`${this.company} ${this.model}'s engine stopped.`);
    }
}

const myCar = new Car('Tata', 'Nano');
myCar.startEngine(); 
myCar.stopEngine();  


// Register form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];
        users.push({ email, password });
        localStorage.setItem('users', JSON.stringify(users));

        window.location.href = 'home.html';
    });
}

// Login form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email && user.password === password);

        if (!user) {
            alert('Invalid email or password. Please register.');
            window.location.href = 'index.html';
        } else {
            window.location.href = 'home.html';
        }
    });
}

// Home page
const userList = document.getElementById('userList');
if (userList) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.email;
        userList.appendChild(li);
    });
}
