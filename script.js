// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize EmailJS
(function() {
    emailjs.init("zcZFF9cngAtv8T_hf");
})();

// Form submission handling (contact form only)
document.querySelector('#contact form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const subject = this.querySelector('select').value;
    const preference = this.querySelectorAll('select')[1].value;
    const message = this.querySelector('textarea').value;
    
    // Simple validation
    if (!name || !email || !subject || !preference) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Prepare email template parameters
    const templateParams = {
        from_name: name,
        from_email: email,
        subject: subject,
        preference: preference,
        message: message,
        to_email: 'phelpssophia@icloud.com'
    };
    
    // Send email using EmailJS
    emailjs.send('service_swmq1iu', 'template_nfn2tvk', templateParams)
        .then(function(response) {
            alert('Thank you for your interest! We will contact you soon to schedule your tutoring session.');
            document.querySelector('form').reset();
        }, function(error) {
            alert('Sorry, there was an error sending your message. Please try again or contact us directly at phelpssophia@icloud.com');
            console.error('EmailJS error:', error);
        })
        .finally(function() {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
});

// Add scroll effect to navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(107, 70, 193, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)';
        navbar.style.backdropFilter = 'none';
    }
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.tutor-card, .subject-card, .option-card, .feature');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Initialize authentication modal
    initAuthModal();
    
    // Initialize tutor functions
    initTutorFunctions();
    
    // Check if user is already logged in
    checkAuthStatus();
});

// User Management and Data Storage
const USER_STORAGE_KEY = 'studystem_user';
const NOTES_STORAGE_KEY = 'studystem_notes';
const CALENDAR_STORAGE_KEY = 'studystem_calendar';

// Special tutor account
const TUTOR_ACCOUNT = {
    name: 'Sophia Phelps',
    email: 'phelpssophia@icloud.com',
    password: 'Ilikederp123!',
    userType: 'tutor',
    role: 'admin'
};

// Get stored data
function getStoredNotes() {
    const notes = localStorage.getItem(NOTES_STORAGE_KEY);
    return notes ? JSON.parse(notes) : [];
}

function getStoredCalendar() {
    const calendar = localStorage.getItem(CALENDAR_STORAGE_KEY);
    return calendar ? JSON.parse(calendar) : [];
}

function saveNotes(notes) {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

function saveCalendar(events) {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
}

function getCurrentUser() {
    const user = localStorage.getItem(USER_STORAGE_KEY);
    return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(USER_STORAGE_KEY);
    }
}

// Check if user is logged in on page load
function checkAuthStatus() {
    const user = getCurrentUser();
    if (user) {
        updateUIForLoggedInUser(user);
        // Ensure dashboard is visible
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            dashboard.style.display = 'block';
            dashboard.style.visibility = 'visible';
        }
    }
}

// Update UI based on login status
function updateUIForLoggedInUser(user) {
    const loginBtn = document.getElementById('loginBtn');
    const dashboard = document.getElementById('dashboard');
    const tutorPanel = document.getElementById('tutorPanel');
    const navMenu = document.querySelector('.nav-menu');
    
    if (loginBtn) {
        const displayName = user.name || `${user.userType.charAt(0).toUpperCase() + user.userType.slice(1)} Account`;
        loginBtn.textContent = displayName;
        loginBtn.style.background = '#e0e7ff';
        loginBtn.onclick = function() {
            const dashboardEl = document.getElementById('dashboard');
            if (dashboardEl) {
                dashboardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };
    }
    
    // Add dashboard link to navigation if it doesn't exist
    if (navMenu) {
        const existingDashboardLink = navMenu.querySelector('a[href="#dashboard"]');
        if (!existingDashboardLink) {
            const dashboardLi = document.createElement('li');
            const dashboardLink = document.createElement('a');
            dashboardLink.href = '#dashboard';
            dashboardLink.textContent = 'Dashboard';
            dashboardLi.appendChild(dashboardLink);
            navMenu.insertBefore(dashboardLi, navMenu.lastElementChild);
        }
    }
    
    // Show dashboard - force display
    if (dashboard) {
        dashboard.style.display = 'block';
        dashboard.style.visibility = 'visible';
        dashboard.classList.add('dashboard-visible');
    }
    
    // Show tutor panel for admin/tutor users
    const isTutor = user.role === 'admin' || user.userType === 'tutor';
    
    if (isTutor && tutorPanel) {
        tutorPanel.style.display = 'block';
        tutorPanel.style.visibility = 'visible';
    } else if (tutorPanel) {
        tutorPanel.style.display = 'none';
    }
    
    // Load and display notes and calendar
    setTimeout(function() {
        loadNotes();
        loadCalendar();
    }, 100);
}

function updateUIForLoggedOut() {
    const loginBtn = document.getElementById('loginBtn');
    const dashboard = document.getElementById('dashboard');
    const tutorPanel = document.getElementById('tutorPanel');
    const navMenu = document.querySelector('.nav-menu');
    
    if (loginBtn) {
        loginBtn.textContent = 'Log In / Sign Up';
        loginBtn.style.background = 'white';
        loginBtn.onclick = function() {
            document.getElementById('authModal').style.display = 'block';
            document.body.style.overflow = 'hidden';
        };
    }
    
    // Remove dashboard link from navigation
    if (navMenu) {
        const dashboardLink = navMenu.querySelector('a[href="#dashboard"]');
        if (dashboardLink) {
            dashboardLink.parentElement.remove();
        }
    }
    
    if (dashboard) {
        dashboard.style.display = 'none';
    }
    
    if (tutorPanel) {
        tutorPanel.style.display = 'none';
    }
}

// Authentication Modal Functionality
function initAuthModal() {
    const modal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeBtn = document.querySelector('.close');
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginFormElement = document.getElementById('loginFormElement');
    const signupFormElement = document.getElementById('signupFormElement');
    
    // Open modal
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const user = getCurrentUser();
            if (!user) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            } else {
                document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Tab switching
    if (loginTab) {
        loginTab.addEventListener('click', function() {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
        });
    }
    
    if (signupTab) {
        signupTab.addEventListener('click', function() {
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            signupForm.classList.add('active');
            loginForm.classList.remove('active');
        });
    }
    
    // Login form submission
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;
            const userType = document.getElementById('loginUserType').value;
            
            if (!email || !password) {
                alert('Please enter your email and password.');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            // Check if it's the tutor account
            let user = null;
            if (email === TUTOR_ACCOUNT.email.toLowerCase() && password === TUTOR_ACCOUNT.password) {
                user = {
                    name: TUTOR_ACCOUNT.name,
                    email: TUTOR_ACCOUNT.email,
                    userType: 'tutor',
                    role: 'admin'
                };
            } else {
                // For other users, require userType selection
                if (!userType) {
                    alert('Please select whether you are a Parent or Student.');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    return;
                }
                // For other users, check if they exist (in a real app, this would check a database)
                // For now, we'll allow any login for demo purposes
                user = {
                    name: email.split('@')[0],
                    email: email,
                    userType: userType,
                    role: 'user'
                };
            }
            
            setTimeout(function() {
                setCurrentUser(user);
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                loginFormElement.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Update UI
                updateUIForLoggedInUser(user);
                
                const welcomeMsg = user.role === 'admin' 
                    ? `Welcome back, ${user.name}! You have tutor admin access. The dashboard is now available.`
                    : `Welcome back, ${user.name}! The dashboard is now available.`;
                alert(welcomeMsg);
                
                // Scroll to dashboard after a brief delay to ensure it's rendered
                setTimeout(function() {
                    const dashboard = document.getElementById('dashboard');
                    if (dashboard) {
                        // Force show dashboard
                        dashboard.style.display = 'block';
                        dashboard.style.visibility = 'visible';
                        // Scroll to it
                        window.scrollTo({
                            top: dashboard.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                }, 200);
            }, 500);
        });
    }
    
    // Signup form submission
    if (signupFormElement) {
        signupFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            const userType = document.getElementById('signupUserType').value;
            
            if (!name || !email || !password || !confirmPassword || !userType) {
                alert('Please fill in all fields.');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match. Please try again.');
                return;
            }
            
            if (password.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating account...';
            submitBtn.disabled = true;
            
            setTimeout(function() {
                const user = {
                    name: name,
                    email: email,
                    userType: userType,
                    role: 'user'
                };
                
                setCurrentUser(user);
                updateUIForLoggedInUser(user);
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                signupFormElement.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                alert(`Account created successfully! Welcome, ${name}!`);
                document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
            }, 500);
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to log out?')) {
                setCurrentUser(null);
                updateUIForLoggedOut();
                alert('You have been logged out successfully.');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
}

// Notes Management
function loadNotes() {
    const notes = getStoredNotes();
    const container = document.getElementById('notesContainer');
    if (!container) return;
    
    if (notes.length === 0) {
        container.innerHTML = '<p class="empty-state">No notes available yet. Check back soon!</p>';
        return;
    }
    
    // Sort notes by date (newest first)
    notes.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = notes.map((note, index) => {
        const user = getCurrentUser();
        const deleteBtn = (user && user.role === 'admin') ? 
            `<button class="delete-btn" onclick="deleteNote(${index})">Delete Note</button>` : '';
        
        return `
            <div class="note-card">
                <h4>${note.title}</h4>
                <div class="note-meta">
                    <span>Subject: ${note.subject}</span>
                    <span>Date: ${new Date(note.date).toLocaleDateString()}</span>
                </div>
                <div class="note-content">${note.content}</div>
                ${deleteBtn}
            </div>
        `;
    }).join('');
}

// Make delete functions globally accessible
window.deleteNote = function(index) {
    if (confirm('Are you sure you want to delete this note?')) {
        const notes = getStoredNotes();
        notes.splice(index, 1);
        saveNotes(notes);
        loadNotes();
    }
};

// Calendar Management
function loadCalendar() {
    const events = getStoredCalendar();
    const container = document.getElementById('calendarContainer');
    if (!container) return;
    
    if (events.length === 0) {
        container.innerHTML = '<p class="empty-state">No upcoming sessions scheduled.</p>';
        return;
    }
    
    // Sort events by date
    events.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
    });
    
    container.innerHTML = events.map((event, index) => {
        const user = getCurrentUser();
        const deleteBtn = (user && user.role === 'admin') ? 
            `<button class="delete-btn" onclick="deleteEvent(${index})">Delete Event</button>` : '';
        
        const eventDate = new Date(event.date + 'T' + event.time);
        const isPast = eventDate < new Date();
        
        return `
            <div class="calendar-event" style="${isPast ? 'opacity: 0.7;' : ''}">
                <h4>${event.title}</h4>
                <div class="event-meta">
                    <span>📅 ${new Date(event.date).toLocaleDateString()}</span>
                    <span>🕐 ${event.time}</span>
                    <span>⏱️ ${event.duration} minutes</span>
                </div>
                ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                ${deleteBtn}
            </div>
        `;
    }).join('');
}

window.deleteEvent = function(index) {
    if (confirm('Are you sure you want to delete this event?')) {
        const events = getStoredCalendar();
        events.splice(index, 1);
        saveCalendar(events);
        loadCalendar();
    }
};

// Initialize tutor functionality
function initTutorFunctions() {
    // Set default date to today for calendar form
    const eventDateInput = document.getElementById('eventDate');
    if (eventDateInput) {
        const today = new Date().toISOString().split('T')[0];
        eventDateInput.setAttribute('min', today);
    }
    
    // Upload notes form
    const uploadNotesForm = document.getElementById('uploadNotesForm');
    if (uploadNotesForm) {
        uploadNotesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('noteTitle').value;
            const subject = document.getElementById('noteSubject').value;
            const content = document.getElementById('noteContent').value;
            const file = document.getElementById('noteFile').files[0];
            
            if (!title || !subject || !content) {
                alert('Please fill in all required fields.');
                return;
            }
            
            const note = {
                title: title,
                subject: subject,
                content: content,
                date: new Date().toISOString(),
                file: file ? file.name : null
            };
            
            const notes = getStoredNotes();
            notes.push(note);
            saveNotes(notes);
            
            alert('Notes uploaded successfully!');
            uploadNotesForm.reset();
            loadNotes();
        });
    }
    
    // Calendar form
    const calendarForm = document.getElementById('calendarForm');
    if (calendarForm) {
        calendarForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('eventTitle').value;
            const date = document.getElementById('eventDate').value;
            const time = document.getElementById('eventTime').value;
            const duration = document.getElementById('eventDuration').value;
            const description = document.getElementById('eventDescription').value;
            
            if (!title || !date || !time || !duration) {
                alert('Please fill in all required fields.');
                return;
            }
            
            const event = {
                title: title,
                date: date,
                time: time,
                duration: duration,
                description: description || ''
            };
            
            const events = getStoredCalendar();
            events.push(event);
            saveCalendar(events);
            
            alert('Event added to calendar successfully!');
            calendarForm.reset();
            // Reset date to today
            if (eventDateInput) {
                const today = new Date().toISOString().split('T')[0];
                eventDateInput.value = today;
            }
            loadCalendar();
        });
    }
}
