// Global one-time guard to prevent double initialization
if (window.__dashboardInitDone) {
    console.warn('Dashboard already initialized, skipping...');
    // Module already executed, do nothing
} else {
    window.__dashboardInitDone = true;

    (async () => {
        const { requireAuth, getCurrentUserFromSession, loadNotes, loadCalendar } = await import('./dashboard.js');
        const { signOut } = await import('./auth.js');
        const { initTutorFunctions } = await import('./script.js');

        // Dashboard-specific initialization
        async function init() {
            // Check if user is logged in, if not redirect to home
            const isAuthenticated = await requireAuth();
            if (!isAuthenticated) {
                return; // requireAuth already handles the redirect
            }
            
            // Get session
            const { getSession } = await import('./auth.js');
            const { session } = await getSession();
            
            if (!session || !session.user) {
                alert('Please log in to access the dashboard.');
                window.location.href = 'index.html';
                return;
            }
            
            // Fetch role from public.profiles table (source of truth)
            const { supabase } = await import('./supabaseClient.js');
            let role = 'student';
            try {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('user_id', session.user.id)
                    .single();
                
                if (!profileError && profile) {
                    role = profile.role || 'student';
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
            
            // Update role debug badge
            const roleBadge = document.getElementById('roleBadge');
            if (roleBadge) {
                roleBadge.textContent = `Role: ${role}`;
            }
            
            // Update UI for logged in user
            const loginBtn = document.getElementById('loginBtn');
            const dashboard = document.getElementById('dashboard');
            const tutorPanel = document.getElementById('tutorPanel');
            
            const user = await getCurrentUserFromSession();
            if (loginBtn) {
                const displayName = user?.name || session.user.email?.split('@')[0] || 'User';
                loginBtn.textContent = displayName;
                loginBtn.style.background = '#e0e7ff';
                loginBtn.onclick = function(e) {
                    e.preventDefault();
                    window.location.href = 'dashboard.html';
                };
            }
            
            // Show dashboard
            if (dashboard) {
                dashboard.style.display = 'block';
                dashboard.style.visibility = 'visible';
            }
            
            // Show tutor panel ONLY when role === 'tutor' (from profiles table)
            if (role === 'tutor') {
                if (tutorPanel) {
                    tutorPanel.style.display = 'block';
                    tutorPanel.style.visibility = 'visible';
                }
            } else {
                if (tutorPanel) {
                    tutorPanel.style.display = 'none';
                    tutorPanel.style.visibility = 'hidden';
                }
            }
            
            // Initialize tutor functions (only once due to guards)
            initTutorFunctions();
            
            // Load notes and calendar
            setTimeout(async function() {
                await loadNotes();
                await loadCalendar();
                if (role === 'tutor') {
                    // Load tutor-specific dropdowns and data
                    const scriptModule = await import('./script.js');
                    scriptModule.loadPendingAccounts();
                    scriptModule.loadStudentDropdown();
                    // Event dropdowns are populated when student is selected via loadStudentDropdown
                }
            }, 100);
            
            // Initialize logout button
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn && !logoutBtn.dataset.bound) {
                logoutBtn.dataset.bound = "true";
                logoutBtn.addEventListener('click', async function() {
                    if (confirm('Are you sure you want to log out?')) {
                        await signOut();
                        alert('You have been logged out successfully.');
                        window.location.href = 'index.html';
                    }
                });
            }
        }
        
        // Start initialization when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            // DOM already loaded
            init();
        }
    })();
}

