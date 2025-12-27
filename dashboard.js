import { getSession } from './auth.js';
import { supabase } from './supabaseClient.js';

// Storage keys for local data (keeping existing localStorage structure)
const NOTES_STORAGE_KEY = 'studystem_notes';
const PENDING_USERS_KEY = 'studystem_pending_users';
const APPROVED_USERS_KEY = 'studystem_approved_users';
const MATERIALS_BUCKET = 'materials';

/**
 * Session guard - redirects to index.html if user is not logged in
 * @returns {Promise<boolean>} - Returns true if user is logged in, false otherwise
 */
export async function requireAuth() {
    try {
        const { session, error } = await getSession();
        
        if (error || !session || !session.user) {
            // User is not logged in, redirect to index.html
            if (window.location.pathname.includes('dashboard.html')) {
                window.location.href = 'index.html';
            }
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error checking session:', error);
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'index.html';
        }
        return false;
    }
}

/**
 * Get stored notes from localStorage
 * @returns {Array} - Array of notes
 */
export function getStoredNotes() {
    const notes = localStorage.getItem(NOTES_STORAGE_KEY);
    return notes ? JSON.parse(notes) : [];
}

/**
 * Get calendar events from Supabase
 * @returns {Promise<Array>} - Array of calendar events
 */
export async function getStoredCalendar() {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('start_at', { ascending: true });

        if (error) {
            console.error('Error fetching events:', error);
            return [];
        }

        // Transform Supabase events to the format expected by the UI
        return (data || []).map(event => {
            const startDate = new Date(event.start_at);
            const endDate = new Date(event.end_at);
            const durationMs = endDate - startDate;
            const durationMinutes = Math.round(durationMs / 60000);

            return {
                id: event.id,
                title: event.title,
                date: startDate.toISOString().split('T')[0],
                time: startDate.toTimeString().slice(0, 5),
                duration: durationMinutes,
                description: event.notes || '',
                tutorId: event.tutor_id,
                studentId: event.student_id,
                startAt: event.start_at,
                endAt: event.end_at
            };
        });
    } catch (error) {
        console.error('Error in getStoredCalendar:', error);
        return [];
    }
}

/**
 * Get pending users from localStorage
 * @returns {Array} - Array of pending users
 */
export function getPendingUsers() {
    const pending = localStorage.getItem(PENDING_USERS_KEY);
    return pending ? JSON.parse(pending) : [];
}

/**
 * Get approved users from localStorage
 * @returns {Array} - Array of approved users
 */
export function getApprovedUsers() {
    const approved = localStorage.getItem(APPROVED_USERS_KEY);
    return approved ? JSON.parse(approved) : [];
}

/**
 * Get current user from session
 * @returns {Promise<object|null>} - Current user object or null
 */
export async function getCurrentUserFromSession() {
    try {
        const { session } = await getSession();
        if (session && session.user) {
            // Extract user info from session
            const userData = session.user.user_metadata || {};
            return {
                id: session.user.id,
                email: session.user.email,
                name: userData.name || session.user.email?.split('@')[0] || 'User',
                userType: userData.userType || 'student',
                role: userData.role || 'user'
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Load and display notes based on user session
 * @returns {Promise<void>}
 */
export async function loadEvents() {
    // This function is named loadEvents but it loads notes
    // Keeping the name for consistency with the requirement
    await loadNotes();
}

/**
 * Load and display notes
 * @returns {Promise<void>}
 */
export async function loadNotes() {
    const notes = getStoredNotes();
    const container = document.getElementById('notesContainer');
    if (!container) return;
    
    const user = await getCurrentUserFromSession();
    if (!user) return;
    
    // Filter notes based on user role
    let filteredNotes = [];
    if (user.role === 'admin' || user.userType === 'tutor') {
        // Tutors only see notes they uploaded
        filteredNotes = notes.filter(note => note.tutorEmail && note.tutorEmail === user.email);
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
            n.date === note.date &&
            n.tutorEmail === note.tutorEmail
        );
        
        const deleteBtn = (user.role === 'admin' || user.userType === 'tutor') ? 
            `<button class="delete-btn" onclick="window.deleteNote(${originalIndex})">Delete Note</button>` : '';
        
        const studentInfo = (user.role === 'admin' || user.userType === 'tutor') && note.studentEmail ? 
            `<span>Student: ${note.studentName || note.studentEmail}</span>` : '';
        
        // File download button
        let fileDownloadBtn = '';
        if (note.file) {
            if (typeof note.file === 'object' && note.file.data && note.file.data.length > 0) {
                const fileName = note.file.name || 'download';
                const fileSize = note.file.size ? formatFileSize(note.file.size) : '';
                fileDownloadBtn = `
                    <a href="#" class="btn-download" onclick="window.downloadNoteFile(${originalIndex}); return false;">
                        📎 Download: ${fileName}${fileSize ? ' (' + fileSize + ')' : ''}
                    </a>
                `;
            } else if (typeof note.file === 'string') {
                fileDownloadBtn = `<p style="color: #6b46c1; margin-top: 0.5rem;">📎 File: ${note.file} (file not available for download)</p>`;
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

// loadMaterials now loads PDF materials - calendar events use loadCalendar()

// Calendar state
let currentCalendarDate = new Date();

/**
 * Load and display calendar
 * @returns {Promise<void>}
 */
export async function loadCalendar() {
    const calendarView = document.getElementById('calendarView');
    const calendarList = document.getElementById('calendarList');
    const monthYear = document.getElementById('currentMonthYear');
    
    if (!calendarView) return;
    
    // Get current user
    const user = await getCurrentUserFromSession();
    if (!user) return;
    
    // Fetch events from Supabase (RLS will filter based on user role)
    const allEvents = await getStoredCalendar();
    
    // Filter events based on user role (RLS handles most of this, but we filter client-side too)
    let events = allEvents;
    
    if (user && (user.role === 'admin' || user.userType === 'tutor')) {
        // Tutors only see events they created
        events = allEvents.filter(event => event.tutorId === user.id);
    } else if (user) {
        // Students only see their own events
        events = allEvents.filter(event => event.studentId === user.id);
    }
    
    // Update month/year display
    if (monthYear) {
        const options = { year: 'numeric', month: 'long' };
        monthYear.textContent = currentCalendarDate.toLocaleDateString('en-US', options);
    }
    
    // Generate calendar grid
    renderCalendarGrid(events, currentCalendarDate, events, user);
    
    // Also update list view as fallback
    if (calendarList) {
        renderCalendarList(events, events, user);
    }
}

/**
 * Render calendar grid
 */
function renderCalendarGrid(events, date, allEvents, user) {
    const calendarView = document.getElementById('calendarView');
    if (!calendarView) return;
    
    const isAdmin = user && (user.role === 'admin' || user.userType === 'tutor');
    
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
            const eventTime = event.time || 'All Day';
            const deleteBtn = isAdmin ? 
                `<button class="delete-event-btn" onclick="window.deleteEvent('${event.id}'); return false;" title="Delete event">×</button>` : '';
            
            html += `<div class="calendar-event-item-wrapper">
                <div class="calendar-event-item" 
                     title="${event.title} - ${eventTime} (${event.duration} min)"
                     onclick="window.showEventDetails('${event.title}', '${event.date}', '${event.time}', '${event.duration}', '${event.description || ''}', '')">
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

/**
 * Render calendar list view
 */
function renderCalendarList(events, allEvents, user) {
    const calendarList = document.getElementById('calendarList');
    if (!calendarList) return;
    
    if (events.length === 0) {
        calendarList.innerHTML = '<p class="empty-state">No upcoming sessions scheduled.</p>';
        return;
    }
    
    const isAdmin = user && (user.role === 'admin' || user.userType === 'tutor');
    
    // Sort events by date
    events.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
    });
    
    calendarList.innerHTML = events.map((event) => {
        const deleteBtn = isAdmin ? 
            `<button class="delete-btn" onclick="window.deleteEvent('${event.id}')">Delete Event</button>` : '';
        
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

/**
 * Format file size helper
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// File download function - make globally accessible
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

// Make functions available globally for onclick handlers
window.showEventDetails = function(title, date, time, duration, description, studentName) {
    const dateStr = new Date(date).toLocaleDateString();
    let details = `Event: ${title}\nDate: ${dateStr}\nTime: ${time}\nDuration: ${duration} minutes`;
    if (description) {
        details += `\n\nDescription: ${description}`;
    }
    alert(details);
};

// Delete event from Supabase
window.deleteEvent = async function(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId);

        if (error) {
            console.error('Error deleting event:', error);
            alert('Error deleting event. Please try again.');
            return;
        }

        alert('Event deleted successfully!');
        // Reload calendar
        await loadCalendar();
    } catch (error) {
        console.error('Error in deleteEvent:', error);
        alert('Error deleting event. Please try again.');
    }
};

// Export calendar date for external access if needed
export { currentCalendarDate };

/**
 * Upload PDF to Supabase Storage and save metadata to public.materials
 * @param {File} file - The PDF file to upload
 * @param {string} studentId - The student user ID
 * @param {string} tutorId - The tutor user ID
 * @param {string|null} eventId - Optional event ID
 * @returns {Promise<{success: boolean, error?: Error, material?: object}>}
 */
export async function uploadMaterial(file, studentId, tutorId, eventId = null) {
    try {
        // Validate file type
        if (file.type !== 'application/pdf') {
            return { success: false, error: new Error('Only PDF files are allowed') };
        }

        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${studentId}/${fileName}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(MATERIALS_BUCKET)
            .upload(filePath, file, {
                contentType: 'application/pdf',
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            return { success: false, error: uploadError };
        }

        // Insert metadata into public.materials
        const { data: materialData, error: insertError } = await supabase
            .from('materials')
            .insert({
                tutor_id: tutorId,
                student_id: studentId,
                event_id: eventId,
                storage_path: filePath,
                filename: file.name,
                size_bytes: file.size,
                mime_type: file.type
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error inserting material metadata:', insertError);
            // Try to delete the uploaded file if metadata insert fails
            await supabase.storage.from(MATERIALS_BUCKET).remove([filePath]);
            return { success: false, error: insertError };
        }

        return { success: true, material: materialData };
    } catch (error) {
        console.error('Error in uploadMaterial:', error);
        return { success: false, error };
    }
}

/**
 * Get materials for the current user (filtered by RLS)
 * @returns {Promise<Array>} - Array of materials
 */
export async function getMaterials() {
    try {
        const { data, error } = await supabase
            .from('materials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching materials:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getMaterials:', error);
        return [];
    }
}

/**
 * Get signed URL for viewing a material
 * @param {string} storagePath - The storage path of the file
 * @param {number} expiresIn - URL expiration time in seconds (default 3600 = 1 hour)
 * @returns {Promise<{url: string|null, error?: Error}>}
 */
export async function getMaterialSignedUrl(storagePath, expiresIn = 3600) {
    try {
        const { data, error } = await supabase.storage
            .from(MATERIALS_BUCKET)
            .createSignedUrl(storagePath, expiresIn);

        if (error) {
            console.error('Error creating signed URL:', error);
            return { url: null, error };
        }

        return { url: data.signedUrl, error: null };
    } catch (error) {
        console.error('Error in getMaterialSignedUrl:', error);
        return { url: null, error };
    }
}

/**
 * Load and display materials/PDFs for the current user
 * @returns {Promise<void>}
 */
export async function loadMaterials() {
    const container = document.getElementById('materialsContainer');
    if (!container) return;

    const user = await getCurrentUserFromSession();
    if (!user) return;

    // Fetch materials from Supabase (RLS will filter based on user role)
    const materials = await getMaterials();

    if (materials.length === 0) {
        container.innerHTML = '<p class="empty-state">No materials available yet. Check back soon!</p>';
        return;
    }

    // Display materials
    container.innerHTML = materials.map(material => {
        const createdDate = new Date(material.created_at).toLocaleDateString();
        const fileSizeKB = material.size_bytes ? (material.size_bytes / 1024).toFixed(2) : 'Unknown';

        return `
            <div class="material-card">
                <div class="material-info">
                    <h4>${material.filename}</h4>
                    <div class="material-meta">
                        <span>📅 ${createdDate}</span>
                        <span>📄 ${fileSizeKB} KB</span>
                    </div>
                </div>
                <button class="btn btn-primary view-material-btn" data-path="${material.storage_path}" data-filename="${material.filename}">
                    View PDF
                </button>
            </div>
        `;
    }).join('');

    // Add click handlers for view buttons
    container.querySelectorAll('.view-material-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const storagePath = this.getAttribute('data-path');
            const filename = this.getAttribute('data-filename');
            
            // Show loading state
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            this.disabled = true;

            // Get signed URL and open in new tab
            const { url, error } = await getMaterialSignedUrl(storagePath);
            
            if (error || !url) {
                alert('Error loading PDF. Please try again.');
                this.textContent = originalText;
                this.disabled = false;
                return;
            }

            // Open PDF in new tab
            window.open(url, '_blank');
            this.textContent = originalText;
            this.disabled = false;
        });
    });
}

