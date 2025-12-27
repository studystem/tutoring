import { supabase } from './supabaseClient.js';

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: object|null, error: Error|null}>}
 */
export async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password
        });

        if (error) {
            return { user: null, error };
        }

        return { user: data.user, error: null };
    } catch (error) {
        return { user: null, error };
    }
}

/**
 * Sign up a new user (optional)
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {object} metadata - Additional user metadata (name, userType, etc.)
 * @returns {Promise<{user: object|null, error: Error|null}>}
 */
export async function signUp(email, password, metadata = {}) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
                data: metadata
            }
        });

        if (error) {
            return { user: null, error };
        }

        return { user: data.user, error: null };
    } catch (error) {
        return { user: null, error };
    }
}

/**
 * Sign out the current user
 * @returns {Promise<{error: Error|null}>}
 */
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        return { error };
    } catch (error) {
        return { error };
    }
}

/**
 * Get the current session
 * @returns {Promise<{session: object|null, error: Error|null}>}
 */
export async function getSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        return { session, error };
    } catch (error) {
        return { session: null, error };
    }
}

/**
 * Get the current user
 * @returns {Promise<{user: object|null, error: Error|null}>}
 */
export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        return { user, error };
    } catch (error) {
        return { user: null, error };
    }
}

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Function} - Function to unsubscribe
 */
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

