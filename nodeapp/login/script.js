// frontend with backend

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.status === 200) {
                // localStorage.setItem('token', data.token);
                window.location.href = 'home.html';
            } else {
                alert('Please check your email or password');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        }
    });
}


// const token = localStorage.getItem('token');
const userList = document.getElementById('userList');
const searchInput = document.getElementById('searchInput');
const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');
const welcomeMessage = document.getElementById('welcomeMessage');
let currentPage = 1;
const limit = 5;

// console.log(userList,token)
if (userList) {
    const fetchUsers = async (search = '', page = 1, limit = 5) => {
        try {
            const response = await fetch(`http://localhost:3001/api/user?search=${search}&page=${page}&limit=${limit}`, {
                credentials: 'include',
                headers: {
                    // 'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log(data)
            if (response.ok) {
                if (welcomeMessage) {
                    welcomeMessage.textContent = `Welcome, ${data.currentuser.first_name} ${data.currentuser.last_name}`;
                }
                userList.innerHTML = data.users.map(user => `<li>${user.email}</li>`).join('');
                currentPage = page;

                if (data.totalusers <= currentPage * limit) {
                    nextPageButton.disabled = true;
                } else {
                    nextPageButton.disabled = false;
                }
    
                prevPageButton.disabled = currentPage === 1;
            } else {
                // alert('Failed to fetch users');
                alert('Failed to fetch users: ' + (data.error || response.statusText));
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred',err);
        }
    };

    fetchUsers();

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchQuery = searchInput.value;
            fetchUsers(searchQuery, 1, limit);
        });
    }

    if (prevPageButton) {
        prevPageButton.addEventListener('click', () => {
            if (currentPage > 1) {
                fetchUsers(searchInput.value, currentPage - 1, limit);
            }
        });
    }

    if (nextPageButton) {
        nextPageButton.addEventListener('click', () => {
            fetchUsers(searchInput.value, currentPage + 1, limit);
        });
    }
}

// const regform = document.getElementById('registerForm')
// if (regform) {
//     regform.addEventListener('submit', async (event) => {
//         event.preventDefault();

//         const email = document.getElementById('email').value;
//         const password = document.getElementById('password').value;
//         const confirmPassword = document.getElementById('confirmPassword').value;
//         const fileInput = document.getElementById('fileInput').files[0];

//         // console.log('asasasa----', fileInput)

//         let lowerCaseLetters = /[a-z]/g;
//         let upperCaseLetters = /[A-Z]/g;
//         let numbers = /\d/g;
//         let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

//         if (password !== confirmPassword) {
//             alert('Passwords do not match');
//             return;
//         } else if (!email.match(validRegex)) {
//             alert('Email is not valid');
//             return;
//         } else if (password.length > 8) {
//             alert('Password must be a maximum of 8 characters');
//             return;
//         } else if (!password.match(numbers)) {
//             alert('Password must contain at least 1 number');
//             return;
//         } else if (!password.match(upperCaseLetters)) {
//             alert('Password must contain at least 1 uppercase letter');
//             return;
//         } else if (!password.match(lowerCaseLetters)) {
//             alert('Password must contain at least 1 lowercase letter');
//             return;
//         }

//         const allowed = ['xlsx', 'xls'];
//         const fileExtension = fileInput.name.split('.').pop().toLowerCase();
//         if (!allowed.includes(fileExtension)) {
//             alert('Invalid file type. Please upload an Excel file.');
//             return;
//         }
//         if (fileInput.size > 1000000) {
//             alert('file size is more than 1 mb that is not allowed')
//             return;
//         }

//         const formData = new FormData();
//         formData.append('email', email);
//         formData.append('password', password);
//         formData.append('confirmPassword', confirmPassword);
//         formData.append('file', fileInput);

//         try {
//             const response = await fetch('http://localhost:3001/auth/register', {
//                 method: 'POST',
//                 body: formData
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 localStorage.setItem('token', data.token);
//                 alert(data.message);
//                 window.location.href = 'login.html';
//             } else {
//                 const errorData = await response.json();
//                 alert(`Registration failed: ${errorData.error}`);
//             }

//         } catch (err) {
//             console.error('Error:', err);
//             alert('An error occurred during registration.');
//         }
//     })
// }


const logoutButton = document.getElementById('logoutButton');
// if (logoutButton) {
//     logoutButton.addEventListener('click', () => {
//         // localStorage.removeItem('token');
//         window.location.href = 'login.html';
//     });
// }

const logout = async () => {
    try {
        const response = await fetch('http://localhost:3001/auth/logout', {
            method: 'GET',
            credentials: 'same-origin', // Important for cookies to be sent
        });

        if (response.ok) {
            // Redirect to the login page or do other post-logout actions
            window.location.href = 'login.html';
        } else {
            console.error('Failed to logout');
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
};

// Example: Trigger logout on a button click
logoutButton.addEventListener('click', logout);





// document.getElementById('uploadForm').addEventListener('submit', async (event) => {
//     event.preventDefault();

//     const fileInput = document.getElementById('fileInput');
//     const formData = new FormData();
//     formData.append('file', fileInput.files[0]);

//     try {
//         const response = await fetch('http://localhost:3001/api/register', {
//             method: 'POST',
//             body: formData
//         });

//         const result = await response.json();
//         alert(result.message);
//     } catch (error) {
//         console.error('Error:', error);
//         alert('An error occurred while uploading the file.');
//     }
// });

// const registerForm = document.getElementById('registerForm');
// if (registerForm) {
//     registerForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const email = document.getElementById('email').value;
//         const password = document.getElementById('password').value;
//         const confirmPassword = document.getElementById('confirmPassword').value;

//         let lowerCaseLetters = /[a-z]/g;
//         let upperCaseLetters = /[A-Z]/g;
//         let numbers = /\d/g;

//         let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

//         if (password !== confirmPassword) {
//             alert('Passwords do not match');
//             return;
//         } else if (!email.match(validRegex)) {
//             alert('Email is not valid');
//             return;
//         } else if (password.length > 8) {
//             alert('Password must be a maximum of 8 characters');
//             return;
//         } else if (!password.match(numbers)) {
//             alert('Password must contain at least 1 number');
//             return;
//         } else if (!password.match(upperCaseLetters)) {
//             alert('Password must contain at least 1 uppercase letter');
//             return;
//         } else if (!password.match(lowerCaseLetters)) {
//             alert('Password must contain at least 1 lowercase letter');
//             return;
//         }

//         try {
//             const response = await fetch('http://localhost:3001/api/auth/register', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body:JSON.stringify({ email, password, confirmPassword }),
//             });

//             const data = await response.json();
//             // console.log(data);
//             if (response.status === 200) {
//                 localStorage.setItem('token', data.token);
//                 window.location.href = 'home.html';
//             } else {
//                 alert('Registration failed');
//             }
//         } catch (err) {
//             console.error(err);
//             alert('An error occurred');
//         }
//     });
// }



// const token = localStorage.getItem('token');
// const userId = localStorage.getItem('userId');
// const userList = document.getElementById('userList');
// if (token && userId && userList) {
//     const fetchUsers = async () => {
//         try {
//             const response = await fetch('http://localhost:3001/api/auth/users', {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             const data = await response.json();
//             if (response.status === 200) {
//                 userList.innerHTML = data.users.map(user => `<li>${user}</li>`).join('');
//             } else {
//                 alert(data.msg || 'Failed to fetch users');
//             }
//         } catch (err) {
//             console.error(err);
//             alert('An error occurred');
//         }
//     };

//     fetchUsers();
// }

















// frontend with backend

// const registerForm = document.getElementById('registerForm');

// if (registerForm) {
//     registerForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const email = document.getElementById('email').value;
//         const password = document.getElementById('password').value;
//         const confirmPassword = document.getElementById('confirmPassword').value;

//         let lowerCaseLetters = /[a-z]/g;
//         let upperCaseLetters = /[A-Z]/g;
//         let numbers = /\d/g;

//         let validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/g;

//         if (password !== confirmPassword) {
//             alert('Passwords do not match');
//             return;
//         } else if (!email.match(validRegex)) {
//             alert('Email is not valid');
//             return;
//         } else if (password.length > 8) {
//             alert('Password must be a maximum of 8 characters');
//             return;
//         } else if (!password.match(numbers)) {
//             alert('Password must contain at least 1 number');
//             return;
//         } else if (!password.match(upperCaseLetters)) {
//             alert('Password must contain at least 1 uppercase letter');
//             return;
//         } else if (!password.match(lowerCaseLetters)) {
//             alert('Password must contain at least 1 lowercase letter');
//             return;
//         }

//         try {
//             const response = await fetch('http://localhost:3001/api/auth/register', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ email, password, confirmPassword }),
//             });

//             const data = await response.json();
//             console.log(data)
//             if (response.status === 200) {
//                 localStorage.setItem('token', data.token);
//                 window.location.href = 'home.html';
//             } else {
//                 alert('Registration failed');
//             }
//         } catch (err) {
//             console.error(err);
//             alert('An error occurred');
//         }
//     });
// }

// const loginForm = document.getElementById('loginForm');
// if (loginForm) {
//     loginForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const email = document.getElementById('loginEmail').value;
//         const password = document.getElementById('loginPassword').value;

//         try {
//             const response = await fetch('http://localhost:3001/api/auth/login', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ email, password }),
//             });

//             const data = await response.json();
//             if (response.status === 200) {
//                 localStorage.setItem('token', data.token);
//                 window.location.href = 'home.html';
//             } else {
//                 alert('Please check your email or password');
//             }
//         } catch (err) {
//             console.error(err);
//             alert('An error occurred');
//         }
//     });
// }

// const token = localStorage.getItem('token');
// const userList = document.getElementById('userList');
// if (token && userList) {
//     const fetchUsers = async () => {
//         try {
//             const response = await fetch('http://localhost:3001/api/auth/users', {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });

//             const data = await response.json();
//             if (response.status === 200) {
//                 userList.innerHTML = data.users.map(user => `<li>${user}</li>`).join('');
//             } else {
//                 alert(data.msg || 'Failed to fetch users');
//             }
//         } catch (err) {
//             console.error(err);
//             alert('An error occurred');
//         }
//     };

//     fetchUsers();
// }

// const logoutButton = document.getElementById('logoutButton');
// if (logoutButton) {
//     logoutButton.addEventListener('click', () => {
//         localStorage.removeItem('token');
//         window.location.href = 'login.html';
//     });
// }
