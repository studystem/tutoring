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
});

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
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
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
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const userType = document.getElementById('loginUserType').value;
            
            if (!email || !password || !userType) {
                alert('Please fill in all fields.');
                return;
            }
            
            // Simulate login (in a real app, this would connect to a backend)
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(function() {
                alert(`Welcome back! You are logged in as a ${userType}.`);
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                loginFormElement.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Update login button to show user is logged in
                if (loginBtn) {
                    loginBtn.textContent = `${userType.charAt(0).toUpperCase() + userType.slice(1)} Account`;
                    loginBtn.style.background = '#e0e7ff';
                }
            }, 1000);
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
            
            // Simulate signup (in a real app, this would connect to a backend)
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating account...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(function() {
                alert(`Account created successfully! Welcome, ${name}! You are registered as a ${userType}.`);
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                signupFormElement.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Update login button to show user is logged in
                if (loginBtn) {
                    loginBtn.textContent = `${userType.charAt(0).toUpperCase() + userType.slice(1)} Account`;
                    loginBtn.style.background = '#e0e7ff';
                }
            }, 1000);
        });
    }
}
