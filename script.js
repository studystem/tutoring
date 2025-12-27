// Import Supabase auth functions
import { signIn, signUp, signOut, getSession, getCurrentUser as getSupabaseUser } from './auth.js';
import { getStoredNotes, getPendingUsers, getApprovedUsers, getCurrentUserFromSession, uploadMaterial } from './dashboard.js';
import { supabase } from './supabaseClient.js';

// User Management and Data Storage
const PENDING_USERS_KEY = 'studystem_pending_users';
const APPROVED_USERS_KEY = 'studystem_approved_users';
const NOTES_STORAGE_KEY = 'studystem_notes';

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

// Storage helper functions (re-exported from dashboard.js for compatibility)
export function saveNotes(notes) {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

// saveCalendar removed - events are now stored in Supabase

export function savePendingUsers(users) {
    localStorage.setItem(PENDING_USERS_KEY, JSON.stringify(users));
}

export function saveApprovedUsers(users) {
    localStorage.setItem(APPROVED_USERS_KEY, JSON.stringify(users));
}

export function isUserApproved(email) {
    const approved = getApprovedUsers();
    return approved.some(user => user.email.toLowerCase() === email.toLowerCase());
}

// Check if user is logged in on page load
async function checkAuthStatus() {
    const user = await getCurrentUserFromSession();
    if (user) {
        await updateUIForLoggedInUser(user);
    }
}

// Update UI based on login status
async function updateUIForLoggedInUser(user) {
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
    
    // Load and display notes and calendar (only on index.html if dashboard section exists)
    if (dashboard) {
        // Import dynamically to avoid circular dependency
        import('./dashboard.js').then(({ loadNotes, loadMaterials, loadCalendar }) => {
            setTimeout(async function() {
                await loadNotes();
                await loadMaterials();
                await loadCalendar();
        if (isTutor) {
            loadPendingAccounts();
            loadStudentDropdown();
        }
    }, 100);
        });
    }
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
        loginBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            const user = await getCurrentUserFromSession();
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
        loginFormElement.addEventListener('submit', async function(e) {
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
            
            try {
                // Try Supabase authentication
                const { user: supabaseUser, error } = await signIn(emailInput, password);
                
                if (error) {
                    // Check if it's a tutor account (legacy support)
            const tutorAccount = findTutorAccount(emailInput, password);
            
            if (tutorAccount) {
                        // For tutor accounts, we still need to handle them specially
                        // But since we're using Supabase, we should create accounts for tutors too
                        alert('Please use the Supabase account for this email. If you need help, contact support.');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    return;
                    } else {
                        alert('Invalid email or password. Please try again.');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    return;
                    }
                }
                
                // Get user info from session (includes profile role)
                const user = await getCurrentUserFromSession();
                if (!user) {
                    alert('Error retrieving user information. Please try again.');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    return;
                }
                
                // Check if user is approved (only for non-tutor accounts)
                if (user.role !== 'tutor' && user.userType !== 'tutor' && user.role !== 'admin') {
                    if (!isUserApproved(user.email)) {
                        await signOut(); // Sign out if not approved
                        alert('Your account is pending verification. Please wait for the tutor to approve your account. You will be notified once approved.');
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        return;
                    }
                }
            
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                loginFormElement.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Update UI
                await updateUIForLoggedInUser(user);
                
                const welcomeMsg = user.role === 'tutor' || user.userType === 'tutor' || user.role === 'admin'
                    ? `Welcome back, ${user.name}! You have tutor admin access. Redirecting to dashboard...`
                    : `Welcome back, ${user.name}! Redirecting to dashboard...`;
                alert(welcomeMsg);
                
                // Redirect to dashboard page
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred during login. Please try again.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Signup form submission
    if (signupFormElement) {
        signupFormElement.addEventListener('submit', async function(e) {
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
            
            // Check if email already exists in pending/approved users
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
            
            try {
                // Determine role based on userType
                const isTutor = userType === 'tutor';
                const role = isTutor ? 'tutor' : 'user';
                
                // Create Supabase account
                const { user: supabaseUser, error } = await signUp(email, password, {
                    name: name,
                    userType: userType,
                    role: role
                });
                
                if (error) {
                    alert(`Error creating account: ${error.message}. Please try again.`);
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    return;
                }
                
                // If tutor, update profile role to 'tutor' and skip approval
                if (isTutor && supabaseUser?.id) {
                    // Try to update profile role (retry a few times in case profile doesn't exist yet)
                    let profileUpdated = false;
                    for (let attempt = 0; attempt < 3; attempt++) {
                        try {
                            const { error: updateError } = await supabase
                                .from('profiles')
                                .update({ role: 'tutor' })
                                .eq('user_id', supabaseUser.id);
                            
                            if (!updateError) {
                                profileUpdated = true;
                                break;
                            }
                            
                            // If profile doesn't exist yet, wait a bit and retry
                            if (attempt < 2) {
                                await new Promise(resolve => setTimeout(resolve, 500));
                            } else {
                                console.error('Error updating tutor profile after retries:', updateError);
                            }
                        } catch (updateErr) {
                            console.error('Error updating tutor profile:', updateErr);
                            if (attempt < 2) {
                                await new Promise(resolve => setTimeout(resolve, 500));
                            }
                        }
                    }
                    
                    // Continue even if profile update failed - metadata has the role
                    
                    // Tutors don't need approval - log them in immediately
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    signupFormElement.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    
                    alert(`Tutor account created successfully! Welcome, ${name}!`);
                    
                    // Update UI for logged in user
                    const user = {
                        id: supabaseUser.id,
                        name: name,
                        email: email,
                        userType: 'tutor',
                        role: 'tutor'
                    };
                    await updateUIForLoggedInUser(user);
                    return;
                }
                
                // For non-tutors, create pending account for approval workflow
                const pendingUser = {
                    name: name,
                    email: email,
                    userType: userType,
                    role: 'user',
                    supabaseId: supabaseUser?.id,
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
            } catch (error) {
                console.error('Signup error:', error);
                alert('An error occurred during signup. Please try again.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Logout functionality (only on index.html)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn && !window.location.pathname.includes('dashboard.html')) {
        logoutBtn.addEventListener('click', async function() {
            if (confirm('Are you sure you want to log out?')) {
                await signOut();
                updateUIForLoggedOut();
                alert('You have been logged out successfully.');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
}

// Account Verification Management
export function loadPendingAccounts() {
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

export async function loadStudentDropdown() {
    try {
        // Get students from Supabase profiles table
        const { data: students, error } = await supabase
            .from('profiles')
            .select('user_id, display_name, role')
            .eq('role', 'student')
            .order('display_name', { ascending: true });

        if (error) {
            console.error('Error loading students:', error);
            // Fallback to approved users from localStorage
    const approved = getApprovedUsers();
            const localStudents = approved.filter(u => u.userType === 'student');
            const studentOptions = '<option value="">Select a student</option>' +
                localStudents.map(student => 
                    `<option value="${student.email}">${student.name} (${student.email})</option>`
                ).join('');
            
    const studentSelect = document.getElementById('noteStudent');
    const eventStudentSelect = document.getElementById('eventStudent');
            if (studentSelect) studentSelect.innerHTML = studentOptions;
            if (eventStudentSelect) eventStudentSelect.innerHTML = studentOptions;
            return;
        }
    
    const studentOptions = '<option value="">Select a student</option>' +
            (students || []).map(student => 
                `<option value="${student.user_id}">${student.display_name || student.user_id}</option>`
        ).join('');

        const studentSelect = document.getElementById('noteStudent');
        const eventStudentSelect = document.getElementById('eventStudent');
    
    if (studentSelect) {
        studentSelect.innerHTML = studentOptions;
    }
    
    if (eventStudentSelect) {
        eventStudentSelect.innerHTML = studentOptions;
    }
    } catch (error) {
        console.error('Error in loadStudentDropdown:', error);
        // Fallback to localStorage
        const approved = getApprovedUsers();
        const students = approved.filter(u => u.userType === 'student');
        const studentOptions = '<option value="">Select a student</option>' +
            students.map(student => 
                `<option value="${student.email}">${student.name} (${student.email})</option>`
            ).join('');
        
        const studentSelect = document.getElementById('noteStudent');
        const eventStudentSelect = document.getElementById('eventStudent');
        if (studentSelect) studentSelect.innerHTML = studentOptions;
        if (eventStudentSelect) eventStudentSelect.innerHTML = studentOptions;
    }
}

// Notes Management functions are now in dashboard.js

// Make delete functions globally accessible
window.deleteNote = async function(index) {
    if (confirm('Are you sure you want to delete this note?')) {
        const notes = getStoredNotes();
        const user = await getCurrentUserFromSession();
        
        if (index >= 0 && index < notes.length) {
            const note = notes[index];
            
            // For tutors, only allow deleting their own notes
            if (user && (user.role === 'admin' || user.userType === 'tutor') && note.tutorEmail && note.tutorEmail !== user.email) {
                alert('You can only delete notes that you uploaded.');
                return;
            }
            
            notes.splice(index, 1);
            saveNotes(notes);
            // Reload notes from dashboard.js
            const { loadNotes } = await import('./dashboard.js');
            await loadNotes();
            alert('Note deleted successfully!');
        } else {
            alert('Error: Note not found.');
        }
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

// Calendar Management functions are now in dashboard.js

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

// deleteEvent is now handled in dashboard.js with Supabase

// Initialize tutor functionality - exported for use in dashboard
export function initTutorFunctions() {
    // Set default date to today for calendar form
    const eventDateInput = document.getElementById('eventDate');
    if (eventDateInput) {
        const today = new Date().toISOString().split('T')[0];
        eventDateInput.setAttribute('min', today);
    }
    
    // Upload notes form
    const uploadNotesForm = document.getElementById('uploadNotesForm');
    if (uploadNotesForm) {
        uploadNotesForm.addEventListener('submit', async function(e) {
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
            
            try {
                // Get current user
                const currentUser = await getCurrentUserFromSession();
                if (!currentUser) {
                    alert('You must be logged in to upload files.');
                    return;
                }

                const studentId = studentEmail; // studentEmail is actually studentId from dropdown
                
                // Validate UUID format
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(studentId)) {
                    alert('Invalid student selection. Please refresh and try again.');
                    return;
                }

                // Get student profile for name
                const { data: studentProfile } = await supabase
                    .from('profiles')
                    .select('display_name, user_id')
                    .eq('user_id', studentId)
                    .single();
                
                const studentName = studentProfile?.display_name || studentId;
            
            // Handle file upload
            if (file) {
                    // Check if it's a PDF - if so, upload to Supabase Storage
                    if (file.type === 'application/pdf') {
                        const tutorId = currentUser.id;

                        // Check file size (limit to 10MB for PDFs)
                        if (file.size > 10 * 1024 * 1024) {
                            alert('PDF file size must be less than 10MB. Please choose a smaller file.');
                            return;
                        }

                        // Show loading state
                        const submitBtn = uploadNotesForm.querySelector('button[type="submit"]');
                        const originalText = submitBtn.textContent;
                        submitBtn.textContent = 'Uploading PDF...';
                        submitBtn.disabled = true;

                        try {
                            // Upload PDF to Supabase Storage
                            const { success, error: uploadError, material } = await uploadMaterial(file, studentId, tutorId, null);

                            if (!success || uploadError) {
                                alert(`Error uploading PDF: ${uploadError?.message || 'Unknown error'}`);
                                submitBtn.textContent = originalText;
                                submitBtn.disabled = false;
                                return;
                            }

                            // Save note without file (file is now in Supabase Storage)
                            const note = {
                                studentEmail: studentId,
                                studentName: studentName,
                                title: title,
                                subject: subject,
                                content: content,
                                date: new Date().toISOString(),
                                file: null,
                                tutorEmail: currentUser.email,
                                materialId: material.id // Link to material in Supabase
                            };
                            
                            const notes = getStoredNotes();
                            notes.push(note);
                            saveNotes(notes);

                            // Note: Email notification skipped - we can't easily access student email from client-side
                            // with RLS. To enable this, store email in profiles table or use a server-side function.
                            
                            alert(`Notes and PDF uploaded successfully for ${studentName}!`);
                            uploadNotesForm.reset();
                            loadStudentDropdown(); // Reset dropdown
                            const { loadNotes, loadMaterials } = await import('./dashboard.js');
                            await loadNotes();
                            await loadMaterials();
                            submitBtn.textContent = originalText;
                            submitBtn.disabled = false;
                        } catch (uploadError) {
                            console.error('Error in PDF upload:', uploadError);
                            const submitBtn = uploadNotesForm.querySelector('button[type="submit"]');
                            submitBtn.textContent = 'Upload Notes';
                            submitBtn.disabled = false;
                            alert('Error uploading PDF. Please try again.');
                        }
                    } else {
                        // Non-PDF files: use old localStorage method (for backward compatibility)
                // Check file size (limit to 5MB to avoid localStorage issues)
                if (file.size > 5 * 1024 * 1024) {
                            alert('File size must be less than 5MB. Please choose a smaller file or use PDF format.');
                    return;
                }
                
                const reader = new FileReader();
                        reader.onload = async function(e) {
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
                                studentEmail: studentId,
                        studentName: studentName,
                        title: title,
                        subject: subject,
                        content: content,
                        date: new Date().toISOString(),
                        file: fileData,
                                tutorEmail: currentUser.email // Track which tutor uploaded this note
                    };
                    
                    const notes = getStoredNotes();
                    notes.push(note);
                    
                    try {
                        saveNotes(notes);
                        
                                // Note: Email notification skipped - we can't easily access student email from client-side
                                // with RLS. To enable this, store email in profiles table or use a server-side function.
                                
                                alert(`Notes and file uploaded successfully for ${studentName}!`);
                        uploadNotesForm.reset();
                        loadStudentDropdown(); // Reset dropdown
                                const { loadNotes } = await import('./dashboard.js');
                                await loadNotes();
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
                    }
            } else {
                    // No file uploaded - save note only
                const note = {
                        studentEmail: studentId,
                    studentName: studentName,
                    title: title,
                    subject: subject,
                    content: content,
                    date: new Date().toISOString(),
                    file: null,
                        tutorEmail: currentUser.email // Track which tutor uploaded this note
                };
                
                const notes = getStoredNotes();
                notes.push(note);
                saveNotes(notes);
                
                    // Note: Email notification skipped - we can't easily access student email from client-side
                    // with RLS. To enable this, store email in profiles table or use a server-side function.
                    
                    alert(`Notes uploaded successfully for ${studentName}!`);
                uploadNotesForm.reset();
                loadStudentDropdown(); // Reset dropdown
                    const { loadNotes } = await import('./dashboard.js');
                    await loadNotes();
                }
            } catch (error) {
                console.error('Error in upload process:', error);
                alert('Error uploading. Please try again.');
            }
        });
    }
    
    // Calendar form
    const calendarForm = document.getElementById('calendarForm');
    if (calendarForm) {
        calendarForm.addEventListener('submit', async function(e) {
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
            
            // studentEmail is now actually studentId (UUID) from the dropdown
            const studentId = studentEmail;
            
            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(studentId)) {
                alert('Invalid student selection. Please refresh and try again.');
                return;
            }
            
            // Get current tutor
            getCurrentUserFromSession().then(async currentUser => {
                if (!currentUser) {
                    alert('You must be logged in to create events.');
                    return;
                }

                const tutorId = currentUser.id;

                // Get student profile for email notification
                const { data: studentProfile } = await supabase
                    .from('profiles')
                    .select('display_name, user_id')
                    .eq('user_id', studentId)
                    .single();
                
                const studentName = studentProfile?.display_name || studentId;

                // Calculate start_at and end_at from date, time, and duration
                const startAt = new Date(`${date}T${time}`);
                const endAt = new Date(startAt.getTime() + (parseInt(duration) * 60000));

                // Insert event into Supabase
                const { data: newEvent, error: insertError } = await supabase
                    .from('events')
                    .insert({
                        tutor_id: tutorId,
                        student_id: studentId,
                        title: title,
                        start_at: startAt.toISOString(),
                        end_at: endAt.toISOString(),
                        notes: description || null
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error('Error creating event:', insertError);
                    alert(`Error creating event: ${insertError.message}`);
                    return;
                }
                
                // Note: Email notification skipped - we can't easily access student email from client-side
                // with RLS. To enable this, you'd need to either:
                // 1. Store email in profiles table, or
                // 2. Use a server-side function to send emails
                
                alert(`Event added to calendar successfully for ${studentName}!`);
            calendarForm.reset();
            // Reset date to today
            if (eventDateInput) {
                const today = new Date().toISOString().split('T')[0];
                eventDateInput.value = today;
            }
            loadStudentDropdown(); // Reset dropdown
                const { loadCalendar } = await import('./dashboard.js');
                await loadCalendar();
            }).catch(error => {
                console.error('Error getting current user:', error);
            });
        });
    }
}
