// User Management and Data Storage - MUST BE DEFINED FIRST
const USER_STORAGE_KEY = 'studystem_user';
const PENDING_USERS_KEY = 'studystem_pending_users';
const APPROVED_USERS_KEY = 'studystem_approved_users';
const NOTES_STORAGE_KEY = 'studystem_notes';
const CALENDAR_STORAGE_KEY = 'studystem_calendar';

// Special tutor accounts
const TUTOR_ACCOUNTS = [
    {
        name: 'Sophia Phelps',
        email: 'phelpssophia@icloud.com',
        password: 'Ilikederp123!',
        userType: 'tutor',
        role: 'admin'
    },
    {
        name: 'Aditya Pillai',
        email: 'adityaxpillai@gmail.com',
        password: 'aditya376',
        userType: 'tutor',
        role: 'admin'
    }
];

// Helper function to find tutor account
function findTutorAccount(email, password) {
    if (!email || !password) return null;
    const normalizedEmail = email.toLowerCase().trim();
    const result = TUTOR_ACCOUNTS.find(tutor => {
        const tutorEmail = tutor.email.toLowerCase().trim();
        const emailMatch = tutorEmail === normalizedEmail;
        const passwordMatch = tutor.password === password;
        return emailMatch && passwordMatch;
    });
    return result;
}

// Smooth scrolling for navigation links (only for anchor links, not external pages)
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // Skip dashboard links
        if (anchor.id === 'dashboardNavLink' || anchor.href.includes('dashboard.html')) {
            return;
        }
        anchor.addEventListener('click', function (e) {
            // Only handle anchor links, not page links
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});

// Initialize EmailJS
(function() {
    emailjs.init("zcZFF9cngAtv8T_hf");
})();

// Email notification helper function
function sendEmailNotification(toEmail, toName, subject, message, notificationType) {
    // EmailJS service and template IDs
    const serviceId = 'service_swmq1iu';
    const templateId = 'template_nfn2tvk'; // Using existing template
    
    const templateParams = {
        from_name: 'StudySTEM Tutoring',
        from_email: 'studystem.tutoring@gmail.com',
        to_email: toEmail,
        to_name: toName,
        subject: subject,
        message: message,
        notification_type: notificationType || 'general'
    };
    
    return emailjs.send(serviceId, templateId, templateParams)
        .then(function(response) {
            console.log('Email notification sent successfully:', response);
            return true;
        }, function(error) {
            console.error('Email notification error:', error);
            return false;
        });
}

// Form submission handling (contact form only) - wait for DOM
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
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
    }
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

// Get stored data
function getStoredNotes() {
    const notes = localStorage.getItem(NOTES_STORAGE_KEY);
    return notes ? JSON.parse(notes) : [];
}

function getStoredCalendar() {
    const calendar = localStorage.getItem(CALENDAR_STORAGE_KEY);
    return calendar ? JSON.parse(calendar) : [];
}

function getPendingUsers() {
    const pending = localStorage.getItem(PENDING_USERS_KEY);
    return pending ? JSON.parse(pending) : [];
}

function getApprovedUsers() {
    const approved = localStorage.getItem(APPROVED_USERS_KEY);
    return approved ? JSON.parse(approved) : [];
}

function saveNotes(notes) {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

function saveCalendar(events) {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
}

function savePendingUsers(users) {
    localStorage.setItem(PENDING_USERS_KEY, JSON.stringify(users));
}

function saveApprovedUsers(users) {
    localStorage.setItem(APPROVED_USERS_KEY, JSON.stringify(users));
}

function isUserApproved(email) {
    const approved = getApprovedUsers();
    return approved.some(user => user.email.toLowerCase() === email.toLowerCase());
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
        // If on index.html and user is logged in, they can access dashboard via navigation
        // Dashboard page will handle its own authentication check
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
        loginBtn.onclick = function(e) {
            e.preventDefault();
            // Redirect to dashboard page
            window.location.href = 'dashboard.html';
        };
    }
    
    // Show dashboard link in navigation - simple approach, just show/hide
    const dashboardNavItem = document.getElementById('dashboardNavItem');
    const dashboardNavLink = document.getElementById('dashboardNavLink');
    
    if (dashboardNavItem && dashboardNavLink) {
        dashboardNavItem.style.display = 'list-item';
        // Set all properties to ensure link is visible and clickable
        dashboardNavLink.href = 'dashboard.html';
        dashboardNavLink.setAttribute('href', 'dashboard.html');
        dashboardNavLink.style.display = 'inline';
        dashboardNavLink.style.visibility = 'visible';
        dashboardNavLink.style.pointerEvents = 'auto';
        dashboardNavLink.style.cursor = 'pointer';
        dashboardNavLink.style.color = 'white';
        dashboardNavLink.style.textDecoration = 'none';
        
        // Remove any existing onclick handlers first
        dashboardNavLink.onclick = null;
        
        // Add explicit click handler that navigates
        dashboardNavLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Dashboard link clicked - navigating to dashboard.html');
            // Verify user is still logged in before navigating
            const currentUser = getCurrentUser();
            if (!currentUser) {
                console.error('User not logged in!');
                alert('You are not logged in. Please log in first.');
                return false;
            }
            console.log('User is logged in, navigating:', currentUser);
            window.location.href = 'dashboard.html';
            return false;
        }, { once: false });
        
        console.log('Dashboard link configured and ready');
        console.log('Dashboard link shown:', dashboardNavLink.href);
    } else if (navMenu) {
        // Fallback: create link dynamically if HTML element doesn't exist
        const existingLink = navMenu.querySelector('#dashboardNavLink') || navMenu.querySelector('a[href="dashboard.html"]');
        if (!existingLink) {
            const dashboardLi = document.createElement('li');
            dashboardLi.id = 'dashboardNavItem';
            const dashboardLink = document.createElement('a');
            dashboardLink.id = 'dashboardNavLink';
            dashboardLink.href = 'dashboard.html';
            dashboardLink.textContent = 'Dashboard';
            dashboardLink.style.pointerEvents = 'auto';
            dashboardLink.style.cursor = 'pointer';
            dashboardLi.appendChild(dashboardLink);
            navMenu.insertBefore(dashboardLi, navMenu.lastElementChild);
            console.log('Dashboard link created dynamically');
        } else {
            const li = existingLink.closest('li');
            if (li) {
                li.id = 'dashboardNavItem';
                li.style.display = 'list-item';
                existingLink.style.pointerEvents = 'auto';
                existingLink.style.cursor = 'pointer';
            }
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
        if (isTutor) {
            loadPendingAccounts();
            loadStudentDropdown();
        }
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
    
    // Hide dashboard link from navigation
    const dashboardNavItem = document.getElementById('dashboardNavItem');
    if (dashboardNavItem) {
        dashboardNavItem.style.display = 'none';
    } else if (navMenu) {
        const dashboardLink = navMenu.querySelector('#dashboardNavLink') || navMenu.querySelector('a[href="dashboard.html"]');
        if (dashboardLink && dashboardLink.closest('li')) {
            dashboardLink.closest('li').style.display = 'none';
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
let authModalInitialized = false;

function initAuthModal() {
    // Prevent multiple initializations - but allow re-initialization on dashboard page
    const isDashboardPage = window.location.pathname.includes('dashboard.html');
    if (authModalInitialized && !isDashboardPage) {
        return;
    }
    authModalInitialized = true;
    
    const modal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeBtn = document.querySelector('.close');
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginFormElement = document.getElementById('loginFormElement');
    const signupFormElement = document.getElementById('signupFormElement');
    
    if (!modal || !loginBtn) {
        return; // Elements don't exist on this page
    }
    
    // Open modal - check if already has listener to avoid duplicates
    if (!loginBtn.hasAttribute('data-auth-listener')) {
        loginBtn.setAttribute('data-auth-listener', 'true');
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const user = getCurrentUser();
            if (!user) {
                if (modal) {
                    modal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                }
            } else {
                // Redirect to dashboard page
                window.location.href = 'dashboard.html';
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
            
            const emailInput = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const userType = document.getElementById('loginUserType').value;
            
            if (!emailInput || !password) {
                alert('Please enter your email and password.');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            // Check if it's a tutor account FIRST (before checking userType)
            let user = null;
            const tutorAccount = findTutorAccount(emailInput, password);
            
            if (tutorAccount) {
                // Tutor account found - skip userType requirement completely
                user = {
                    name: tutorAccount.name,
                    email: tutorAccount.email,
                    userType: 'tutor',
                    role: 'admin'
                };
            } else {
                // Not a tutor - require userType selection for regular users
                if (!userType) {
                    alert('Please select whether you are a Parent or Student.');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    return;
                }
                
                // Use lowercase email for regular user lookup
                const email = emailInput.toLowerCase();
                
                // Check if user is approved
                if (!isUserApproved(email)) {
                    alert('Your account is pending verification. Please wait for the tutor to approve your account. You will be notified once approved.');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    return;
                }
                
                // Get approved user info
                const approved = getApprovedUsers();
                const approvedUser = approved.find(u => u.email.toLowerCase() === email.toLowerCase());
                
                if (approvedUser) {
                    user = {
                        name: approvedUser.name,
                        email: approvedUser.email,
                        userType: approvedUser.userType,
                        role: 'user'
                    };
                } else {
                    alert('Account not found. Please sign up first.');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    return;
                }
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
                    ? `Welcome back, ${user.name}! You have tutor admin access. Redirecting to dashboard...`
                    : `Welcome back, ${user.name}! Redirecting to dashboard...`;
                alert(welcomeMsg);
                
                // Redirect to dashboard page
                window.location.href = 'dashboard.html';
            }, 500);
        });
    }
    
    // Signup form submission
    if (signupFormElement) {
        signupFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value.trim().toLowerCase();
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
            
            // Check if email already exists
            const pending = getPendingUsers();
            const approved = getApprovedUsers();
            if (pending.some(u => u.email.toLowerCase() === email) || 
                approved.some(u => u.email.toLowerCase() === email)) {
                alert('An account with this email already exists. Please log in instead.');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating account...';
            submitBtn.disabled = true;
            
            setTimeout(function() {
                // Create pending account
                const pendingUser = {
                    name: name,
                    email: email,
                    password: password, // In production, this should be hashed
                    userType: userType,
                    role: 'user',
                    createdAt: new Date().toISOString()
                };
                
                pending.push(pendingUser);
                savePendingUsers(pending);
                
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                signupFormElement.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                alert(`Account created successfully! Your account is pending verification by the tutor. You will be able to log in once your account is approved.`);
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
                // Redirect to home page
                if (window.location.pathname.includes('dashboard.html')) {
                    window.location.href = 'index.html';
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });
    }
}

// Account Verification Management
function loadPendingAccounts() {
    const pending = getPendingUsers();
    const container = document.getElementById('pendingAccountsContainer');
    if (!container) return;
    
    if (pending.length === 0) {
        container.innerHTML = '<p class="empty-state">No pending account verifications.</p>';
        return;
    }
    
    container.innerHTML = pending.map((user, index) => {
        const date = new Date(user.createdAt).toLocaleDateString();
        return `
            <div class="pending-account-card">
                <div class="pending-account-info">
                    <h5>${user.name}</h5>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Type:</strong> ${user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}</p>
                    <p><strong>Requested:</strong> ${date}</p>
                </div>
                <div class="account-actions">
                    <button class="btn-approve" onclick="approveAccount(${index})">Approve</button>
                    <button class="btn-reject" onclick="rejectAccount(${index})">Reject</button>
                </div>
            </div>
        `;
    }).join('');
}

window.approveAccount = function(index) {
    const pending = getPendingUsers();
    const approved = getApprovedUsers();
    
    if (index >= 0 && index < pending.length) {
        const user = pending[index];
        // Remove password before saving to approved (in production, never store passwords)
        const { password, ...userWithoutPassword } = user;
        approved.push(userWithoutPassword);
        pending.splice(index, 1);
        
        saveApprovedUsers(approved);
        savePendingUsers(pending);
        
        loadPendingAccounts();
        loadStudentDropdown();
        alert(`Account for ${user.name} has been approved!`);
    }
};

window.rejectAccount = function(index) {
    const pending = getPendingUsers();
    
    if (index >= 0 && index < pending.length) {
        const user = pending[index];
        if (confirm(`Are you sure you want to reject the account for ${user.name}?`)) {
            pending.splice(index, 1);
            savePendingUsers(pending);
            loadPendingAccounts();
            alert(`Account for ${user.name} has been rejected.`);
        }
    }
};

function loadStudentDropdown() {
    const approved = getApprovedUsers();
    const studentSelect = document.getElementById('noteStudent');
    const eventStudentSelect = document.getElementById('eventStudent');
    
    // Filter to only students (not parents)
    const students = approved.filter(u => u.userType === 'student');
    const studentOptions = '<option value="">Select a student</option>' +
        students.map(student => 
            `<option value="${student.email}">${student.name} (${student.email})</option>`
        ).join('');
    
    if (studentSelect) {
        studentSelect.innerHTML = studentOptions;
    }
    
    if (eventStudentSelect) {
        eventStudentSelect.innerHTML = studentOptions;
    }
}

// Notes Management (Student-Specific)
function loadNotes() {
    const notes = getStoredNotes();
    const container = document.getElementById('notesContainer');
    if (!container) return;
    
    const user = getCurrentUser();
    if (!user) return;
    
    // Filter notes based on user role
    let filteredNotes = [];
    if (user.role === 'admin') {
        // Tutors see all notes
        filteredNotes = notes;
    } else {
        // Students/parents only see their own notes
        filteredNotes = notes.filter(note => note.studentEmail === user.email);
    }
    
    if (filteredNotes.length === 0) {
        container.innerHTML = '<p class="empty-state">No notes available yet. Check back soon!</p>';
        return;
    }
    
    // Sort notes by date (newest first)
    filteredNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = filteredNotes.map((note, noteIndex) => {
        // Find original index in full notes array for deletion and file download
        const originalIndex = notes.findIndex(n => 
            n.title === note.title && 
            n.studentEmail === note.studentEmail && 
            n.date === note.date
        );
        
        const user = getCurrentUser();
        const deleteBtn = (user && user.role === 'admin') ? 
            `<button class="delete-btn" onclick="deleteNote(${originalIndex})">Delete Note</button>` : '';
        
        const studentInfo = user.role === 'admin' && note.studentEmail ? 
            `<span>Student: ${note.studentName || note.studentEmail}</span>` : '';
        
        // File download button
        let fileDownloadBtn = '';
        if (note.file) {
            // Check if file has data (new format with base64 data)
            if (typeof note.file === 'object' && note.file.data && note.file.data.length > 0) {
                // New format with file data - always show download button
                const fileName = note.file.name || 'download';
                const fileSize = note.file.size ? formatFileSize(note.file.size) : '';
                fileDownloadBtn = `
                    <a href="#" class="btn-download" onclick="downloadNoteFile(${originalIndex}); return false;">
                        📎 Download: ${fileName}${fileSize ? ' (' + fileSize + ')' : ''}
                    </a>
                `;
            } else if (typeof note.file === 'string') {
                // Legacy format (just filename) - show message but no download
                fileDownloadBtn = `<p style="color: #6b46c1; margin-top: 0.5rem;">📎 File: ${note.file} (file not available for download)</p>`;
            } else if (typeof note.file === 'object' && note.file.name && !note.file.data) {
                // File object exists but no data - might be corrupted
                fileDownloadBtn = `<p style="color: #ef4444; margin-top: 0.5rem;">📎 File: ${note.file.name} (file data missing - please re-upload)</p>`;
            } else {
                // Unknown file format
                console.warn('Unknown file format in note:', note.file);
            }
        }
        
        return `
            <div class="note-card">
                <h4>${note.title}</h4>
                <div class="note-meta">
                    <span>Subject: ${note.subject}</span>
                    <span>Date: ${new Date(note.date).toLocaleDateString()}</span>
                    ${studentInfo}
                </div>
                <div class="note-content">${note.content}</div>
                ${fileDownloadBtn}
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

// File download function
window.downloadNoteFile = function(noteIndex) {
    const notes = getStoredNotes();
    if (noteIndex < 0 || noteIndex >= notes.length) {
        alert('Note not found.');
        return;
    }
    
    const note = notes[noteIndex];
    
    if (!note.file) {
        alert('No file attached to this note.');
        return;
    }
    
    if (!note.file.data) {
        alert('File data is missing. The file cannot be downloaded.');
        return;
    }
    
    try {
        // Handle base64 data URL format (data:type/subtype;base64,...)
        let base64Data = note.file.data;
        
        // If it's already a data URL, extract the base64 part
        if (base64Data.includes(',')) {
            base64Data = base64Data.split(',')[1];
        }
        
        // Decode base64 to binary
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        // Create blob with proper MIME type
        const mimeType = note.file.type || 'application/octet-stream';
        const blob = new Blob([byteArray], { type: mimeType });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = note.file.name || 'download';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(function() {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Error downloading file. Please try again or contact support.');
    }
};

// Format file size helper
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Calendar Management with Google Calendar-style view
let currentCalendarDate = new Date();

function loadCalendar() {
    const allEvents = getStoredCalendar();
    const calendarView = document.getElementById('calendarView');
    const calendarList = document.getElementById('calendarList');
    const monthYear = document.getElementById('currentMonthYear');
    
    if (!calendarView) return;
    
    // Filter events based on user role
    const user = getCurrentUser();
    let events = [];
    
    if (user && user.role === 'admin') {
        // Tutors see all events
        events = allEvents;
    } else if (user) {
        // Students/parents only see their own events
        events = allEvents.filter(event => event.studentEmail === user.email);
    }
    
    // Update month/year display
    if (monthYear) {
        const options = { year: 'numeric', month: 'long' };
        monthYear.textContent = currentCalendarDate.toLocaleDateString('en-US', options);
    }
    
    // Generate calendar grid
    renderCalendarGrid(events, currentCalendarDate, allEvents);
    
    // Also update list view as fallback
    if (calendarList) {
        renderCalendarList(events, allEvents);
    }
}

function renderCalendarGrid(events, date, allEvents) {
    const calendarView = document.getElementById('calendarView');
    if (!calendarView) return;
    
    const user = getCurrentUser();
    const isAdmin = user && user.role === 'admin';
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Get previous month's days to fill the grid
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    // Day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = '<div class="calendar-header">';
    dayNames.forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });
    html += '</div><div class="calendar-grid">';
    
    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        html += `<div class="calendar-day other-month">
            <div class="calendar-day-number">${day}</div>
        </div>`;
    }
    
    // Current month's days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = today.getFullYear() === year && 
                       today.getMonth() === month && 
                       today.getDate() === day;
        
        // Get events for this day
        const dayEvents = events.filter(e => e.date === dateStr);
        
        html += `<div class="calendar-day ${isToday ? 'today' : ''}">
            <div class="calendar-day-number">${day}</div>`;
        
        dayEvents.forEach((event) => {
            // Find original index in allEvents for deletion
            const originalIndex = allEvents.findIndex(e => 
                e.title === event.title && 
                e.date === event.date && 
                e.time === event.time &&
                e.studentEmail === event.studentEmail
            );
            
            const eventTime = event.time || 'All Day';
            const deleteBtn = isAdmin ? 
                `<button class="delete-event-btn" onclick="deleteEvent(${originalIndex}); return false;" title="Delete event">×</button>` : '';
            
            html += `<div class="calendar-event-item-wrapper">
                <div class="calendar-event-item" 
                     title="${event.title} - ${eventTime} (${event.duration} min)"
                     onclick="showEventDetails('${event.title}', '${event.date}', '${event.time}', '${event.duration}', '${event.description || ''}', '${event.studentName || event.studentEmail || ''}')">
                    ${event.title} - ${eventTime}
                </div>
                ${deleteBtn}
            </div>`;
        });
        
        html += '</div>';
    }
    
    // Next month's leading days to complete the grid
    const totalCells = startingDayOfWeek + daysInMonth;
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells && day <= 14; day++) {
        html += `<div class="calendar-day other-month">
            <div class="calendar-day-number">${day}</div>
        </div>`;
    }
    
    html += '</div>';
    calendarView.innerHTML = html;
    
    // Add navigation handlers
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    
    if (prevBtn) {
        prevBtn.onclick = function() {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            loadCalendar();
        };
    }
    
    if (nextBtn) {
        nextBtn.onclick = function() {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            loadCalendar();
        };
    }
}

function renderCalendarList(events, allEvents) {
    const calendarList = document.getElementById('calendarList');
    if (!calendarList) return;
    
    if (events.length === 0) {
        calendarList.innerHTML = '<p class="empty-state">No upcoming sessions scheduled.</p>';
        return;
    }
    
    const user = getCurrentUser();
    const isAdmin = user && user.role === 'admin';
    
    // Sort events by date
    events.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
    });
    
    calendarList.innerHTML = events.map((event) => {
        // Find original index in allEvents for deletion
        const originalIndex = allEvents.findIndex(e => 
            e.title === event.title && 
            e.date === event.date && 
            e.time === event.time &&
            e.studentEmail === event.studentEmail
        );
        
        const deleteBtn = isAdmin ? 
            `<button class="delete-btn" onclick="deleteEvent(${originalIndex})">Delete Event</button>` : '';
        
        const eventDate = new Date(event.date + 'T' + event.time);
        const isPast = eventDate < new Date();
        
        const studentInfo = isAdmin && event.studentName ? 
            `<span>Student: ${event.studentName}</span>` : '';
        
        return `
            <div class="calendar-event" style="${isPast ? 'opacity: 0.7;' : ''}">
                <h4>${event.title}</h4>
                <div class="event-meta">
                    <span>📅 ${new Date(event.date).toLocaleDateString()}</span>
                    <span>🕐 ${event.time}</span>
                    <span>⏱️ ${event.duration} minutes</span>
                    ${studentInfo}
                </div>
                ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                ${deleteBtn}
            </div>
        `;
    }).join('');
}

window.showEventDetails = function(title, date, time, duration, description, studentName) {
    const dateStr = new Date(date).toLocaleDateString();
    let details = `Event: ${title}\nDate: ${dateStr}\nTime: ${time}\nDuration: ${duration} minutes`;
    if (studentName) {
        details += `\nStudent: ${studentName}`;
    }
    if (description) {
        details += `\n\nDescription: ${description}`;
    }
    alert(details);
};

window.deleteEvent = function(index) {
    if (confirm('Are you sure you want to delete this event?')) {
        const events = getStoredCalendar();
        if (index >= 0 && index < events.length) {
            events.splice(index, 1);
            saveCalendar(events);
            loadCalendar();
            alert('Event deleted successfully!');
        } else {
            alert('Error: Event not found.');
        }
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
            
            const studentEmail = document.getElementById('noteStudent').value;
            const title = document.getElementById('noteTitle').value;
            const subject = document.getElementById('noteSubject').value;
            const content = document.getElementById('noteContent').value;
            const fileInput = document.getElementById('noteFile');
            const file = fileInput.files[0];
            
            if (!studentEmail || !title || !subject || !content) {
                alert('Please fill in all required fields, including selecting a student.');
                return;
            }
            
            // Get student name
            const approved = getApprovedUsers();
            const student = approved.find(u => u.email === studentEmail);
            const studentName = student ? student.name : studentEmail;
            
            // Handle file upload
            if (file) {
                // Check file size (limit to 5MB to avoid localStorage issues)
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB. Please choose a smaller file.');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const fileDataUrl = e.target.result;
                    
                    // Validate that we got the file data
                    if (!fileDataUrl || fileDataUrl.length === 0) {
                        alert('Error: File data could not be read. Please try again.');
                        return;
                    }
                    
                    const fileData = {
                        name: file.name,
                        type: file.type || 'application/octet-stream',
                        size: file.size,
                        data: fileDataUrl // Base64 encoded file (data URL format)
                    };
                    
                    // Verify data URL format
                    if (!fileDataUrl.startsWith('data:')) {
                        console.warn('File data URL format unexpected:', fileDataUrl.substring(0, 50));
                    }
                    
                    const note = {
                        studentEmail: studentEmail,
                        studentName: studentName,
                        title: title,
                        subject: subject,
                        content: content,
                        date: new Date().toISOString(),
                        file: fileData
                    };
                    
                    const notes = getStoredNotes();
                    notes.push(note);
                    
                    try {
                        saveNotes(notes);
                        
                        // Send email notification to student
                        const emailSubject = `New Tutoring Notes: ${title}`;
                        const emailMessage = `Hello ${studentName},\n\nNew tutoring notes have been uploaded for you!\n\n` +
                            `Title: ${title}\n` +
                            `Subject: ${subject}\n` +
                            `Date: ${new Date().toLocaleDateString()}\n\n` +
                            `Please log in to your dashboard to view the notes and download the attached file.\n\n` +
                            `Best regards,\nStudySTEM Tutoring`;
                        
                        sendEmailNotification(studentEmail, studentName, emailSubject, emailMessage, 'notes')
                            .then(sent => {
                                if (sent) {
                                    console.log('Email notification sent to student');
                                }
                            });
                        
                        alert(`Notes and file uploaded successfully for ${studentName}! An email notification has been sent.`);
                        uploadNotesForm.reset();
                        loadStudentDropdown(); // Reset dropdown
                        loadNotes();
                    } catch (error) {
                        console.error('Error saving notes:', error);
                        if (error.name === 'QuotaExceededError') {
                            alert('Error: File is too large or storage is full. Please try a smaller file.');
                        } else {
                            alert('Error saving notes. Please try again.');
                        }
                    }
                };
                
                reader.onerror = function(error) {
                    console.error('FileReader error:', error);
                    alert('Error reading file. Please try again or choose a different file.');
                };
                
                reader.readAsDataURL(file);
            } else {
                // No file uploaded
                const note = {
                    studentEmail: studentEmail,
                    studentName: studentName,
                    title: title,
                    subject: subject,
                    content: content,
                    date: new Date().toISOString(),
                    file: null
                };
                
                const notes = getStoredNotes();
                notes.push(note);
                saveNotes(notes);
                
                // Send email notification to student
                const emailSubject = `New Tutoring Notes: ${title}`;
                const emailMessage = `Hello ${studentName},\n\nNew tutoring notes have been uploaded for you!\n\n` +
                    `Title: ${title}\n` +
                    `Subject: ${subject}\n` +
                    `Date: ${new Date().toLocaleDateString()}\n\n` +
                    `Please log in to your dashboard to view the notes.\n\n` +
                    `Best regards,\nStudySTEM Tutoring`;
                
                sendEmailNotification(studentEmail, studentName, emailSubject, emailMessage, 'notes')
                    .then(sent => {
                        if (sent) {
                            console.log('Email notification sent to student');
                        }
                    });
                
                alert(`Notes uploaded successfully for ${studentName}! An email notification has been sent.`);
                uploadNotesForm.reset();
                loadStudentDropdown(); // Reset dropdown
                loadNotes();
            }
        });
    }
    
    // Calendar form
    const calendarForm = document.getElementById('calendarForm');
    if (calendarForm) {
        calendarForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const studentEmail = document.getElementById('eventStudent').value;
            const title = document.getElementById('eventTitle').value;
            const date = document.getElementById('eventDate').value;
            const time = document.getElementById('eventTime').value;
            const duration = document.getElementById('eventDuration').value;
            const description = document.getElementById('eventDescription').value;
            
            if (!studentEmail || !title || !date || !time || !duration) {
                alert('Please fill in all required fields, including selecting a student.');
                return;
            }
            
            // Get student name
            const approved = getApprovedUsers();
            const student = approved.find(u => u.email === studentEmail);
            const studentName = student ? student.name : studentEmail;
            
            const event = {
                studentEmail: studentEmail,
                studentName: studentName,
                title: title,
                date: date,
                time: time,
                duration: duration,
                description: description || ''
            };
            
            const events = getStoredCalendar();
            events.push(event);
            saveCalendar(events);
            
            // Send email notification to student
            const eventDate = new Date(date);
            const formattedDate = eventDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            const emailSubject = `New Tutoring Session Scheduled: ${title}`;
            const emailMessage = `Hello ${studentName},\n\nA new tutoring session has been scheduled for you!\n\n` +
                `Session Details:\n` +
                `Title: ${title}\n` +
                `Date: ${formattedDate}\n` +
                `Time: ${time}\n` +
                `Duration: ${duration} minutes\n` +
                (description ? `Description: ${description}\n` : '') +
                `\nPlease log in to your dashboard to view all your scheduled sessions.\n\n` +
                `Best regards,\nStudySTEM Tutoring`;
            
            sendEmailNotification(studentEmail, studentName, emailSubject, emailMessage, 'calendar')
                .then(sent => {
                    if (sent) {
                        console.log('Email notification sent to student');
                    }
                });
            
            alert(`Event added to calendar successfully for ${studentName}! An email notification has been sent.`);
            calendarForm.reset();
            // Reset date to today
            if (eventDateInput) {
                const today = new Date().toISOString().split('T')[0];
                eventDateInput.value = today;
            }
            loadStudentDropdown(); // Reset dropdown
            loadCalendar();
        });
    }
}
