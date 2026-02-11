/**
 * Supabase Client Configuration
 * تعليمي - منصة التعلم التفاعلي
 */

// Supabase Configuration - تم التحديث
const SUPABASE_URL = 'https://ollwqisezqkawrulahqq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HnNvDq3tgZa1GBODyM8FxA_Z2mMyqDF';

// Check if Supabase library is loaded
if (typeof supabase === 'undefined') {
    console.error('Supabase library not loaded! Make sure to include the Supabase script.');
}

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

/**
 * ============================================
 * AUTHENTICATION FUNCTIONS
 * ============================================
 */

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} fullName - User full name
 * @returns {Promise} - Registration result
 */
async function signUp(email, password, fullName) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    role: 'teacher',
                    created_at: new Date().toISOString()
                },
                emailRedirectTo: `${window.location.origin}/pages/dashboard.html`
            }
        });
        
        if (error) throw error;
        
        // Create user profile in users table
        if (data.user) {
            const { error: profileError } = await supabaseClient
                .from('users')
                .insert([
                    {
                        id: data.user.id,
                        email: data.user.email,
                        full_name: fullName,
                        role: 'teacher',
                        created_at: new Date().toISOString()
                    }
                ]);
            
            if (profileError) {
                console.error('Error creating user profile:', profileError);
            }
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('Signup error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Sign in existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Login result
 */
async function signIn(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('Login error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Sign out current user
 * @returns {Promise} - Logout result
 */
async function signOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        
        // Clear local storage
        localStorage.removeItem('user');
        localStorage.removeItem('supabase.auth.token');
        
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Get current user
 * @returns {Promise} - Current user data
 */
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error) throw error;
        
        return { success: true, user };
    } catch (error) {
        console.error('Get user error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Reset password
 * @param {string} email - User email
 * @returns {Promise} - Password reset result
 */
async function resetPassword(email) {
    try {
        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/pages/reset-password.html`
        });
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('Password reset error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise} - Update result
 */
async function updatePassword(newPassword) {
    try {
        const { data, error } = await supabaseClient.auth.updateUser({
            password: newPassword
        });
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('Password update error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * ============================================
 * COURSE MANAGEMENT FUNCTIONS
 * ============================================
 */

/**
 * Create a new course
 * @param {Object} courseData - Course data object
 * @returns {Promise} - Creation result
 */
async function createCourse(courseData) {
    try {
        const user = await getCurrentUser();
        if (!user.success) throw new Error('User not authenticated');
        
        const course = {
            ...courseData,
            user_id: user.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabaseClient
            .from('courses')
            .insert([course])
            .select();
        
        if (error) throw error;
        
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Create course error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Get all courses for a user
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise} - Courses data
 */
async function getUserCourses(userId = null) {
    try {
        let query = supabaseClient.from('courses').select('*');
        
        if (userId) {
            query = query.eq('user_id', userId);
        } else {
            const user = await getCurrentUser();
            if (user.success) {
                query = query.eq('user_id', user.user.id);
            }
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('Get courses error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Get a single course by ID
 * @param {string} courseId - Course ID
 * @returns {Promise} - Course data
 */
async function getCourse(courseId) {
    try {
        const { data, error } = await supabaseClient
            .from('courses')
            .select(`
                *,
                interactions (*),
                enrollments (
                    *,
                    users (*)
                )
            `)
            .eq('id', courseId)
            .single();
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('Get course error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Update a course
 * @param {string} courseId - Course ID
 * @param {Object} courseData - Updated course data
 * @returns {Promise} - Update result
 */
async function updateCourse(courseId, courseData) {
    try {
        const updateData = {
            ...courseData,
            updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabaseClient
            .from('courses')
            .update(updateData)
            .eq('id', courseId)
            .select();
        
        if (error) throw error;
        
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Update course error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a course
 * @param {string} courseId - Course ID
 * @returns {Promise} - Deletion result
 */
async function deleteCourse(courseId) {
    try {
        const { error } = await supabaseClient
            .from('courses')
            .delete()
            .eq('id', courseId);
        
        if (error) throw error;
        
        return { success: true };
    } catch (error) {
        console.error('Delete course error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * ============================================
 * INTERACTIONS FUNCTIONS
 * ============================================
 */

/**
 * Create a new interaction
 * @param {Object} interactionData - Interaction data
 * @returns {Promise} - Creation result
 */
async function createInteraction(interactionData) {
    try {
        const { data, error } = await supabaseClient
            .from('interactions')
            .insert([{
                ...interactionData,
                created_at: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Create interaction error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Get interactions for a course
 * @param {string} courseId - Course ID
 * @returns {Promise} - Interactions data
 */
async function getCourseInteractions(courseId) {
    try {
        const { data, error } = await supabaseClient
            .from('interactions')
            .select('*')
            .eq('course_id', courseId)
            .order('time', { ascending: true });
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('Get interactions error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Delete an interaction
 * @param {string} interactionId - Interaction ID
 * @returns {Promise} - Deletion result
 */
async function deleteInteraction(interactionId) {
    try {
        const { error } = await supabaseClient
            .from('interactions')
            .delete()
            .eq('id', interactionId);
        
        if (error) throw error;
        
        return { success: true };
    } catch (error) {
        console.error('Delete interaction error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * ============================================
 * ENROLLMENT FUNCTIONS
 * ============================================
 */

/**
 * Enroll a student in a course
 * @param {string} courseId - Course ID
 * @param {string} studentId - Student ID
 * @returns {Promise} - Enrollment result
 */
async function enrollStudent(courseId, studentId) {
    try {
        const { data, error } = await supabaseClient
            .from('enrollments')
            .insert([{
                course_id: courseId,
                student_id: studentId,
                enrolled_at: new Date().toISOString(),
                progress: 0,
                completed: false
            }])
            .select();
        
        if (error) throw error;
        
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Enroll student error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Get student progress in a course
 * @param {string} courseId - Course ID
 * @param {string} studentId - Student ID
 * @returns {Promise} - Progress data
 */
async function getStudentProgress(courseId, studentId) {
    try {
        const { data, error } = await supabaseClient
            .from('enrollments')
            .select('*')
            .eq('course_id', courseId)
            .eq('student_id', studentId)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('Get progress error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Update student progress
 * @param {string} courseId - Course ID
 * @param {string} studentId - Student ID
 * @param {number} progress - Progress percentage
 * @param {boolean} completed - Whether course is completed
 * @returns {Promise} - Update result
 */
async function updateProgress(courseId, studentId, progress, completed = false) {
    try {
        const updateData = {
            progress: progress,
            updated_at: new Date().toISOString()
        };
        
        if (completed) {
            updateData.completed = true;
            updateData.completed_at = new Date().toISOString();
        }
        
        const { data, error } = await supabaseClient
            .from('enrollments')
            .update(updateData)
            .eq('course_id', courseId)
            .eq('student_id', studentId)
            .select();
        
        if (error) throw error;
        
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Update progress error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * ============================================
 * STUDENT RESPONSES FUNCTIONS
 * ============================================
 */

/**
 * Save student response to an interaction
 * @param {Object} responseData - Response data
 * @returns {Promise} - Save result
 */
async function saveStudentResponse(responseData) {
    try {
        const { data, error } = await supabaseClient
            .from('student_responses')
            .insert([{
                ...responseData,
                responded_at: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Save response error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Get student responses for a course
 * @param {string} courseId - Course ID
 * @param {string} studentId - Student ID
 * @returns {Promise} - Responses data
 */
async function getStudentResponses(courseId, studentId) {
    try {
        const { data, error } = await supabaseClient
            .from('student_responses')
            .select(`
                *,
                interactions (*)
            `)
            .eq('student_id', studentId)
            .eq('interactions.course_id', courseId);
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('Get responses error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * ============================================
 * CLASSROOM SESSIONS FUNCTIONS
 * ============================================
 */

/**
 * Create a new classroom session
 * @param {Object} sessionData - Session data
 * @returns {Promise} - Creation result
 */
async function createClassroomSession(sessionData) {
    try {
        // Generate unique session code
        const sessionCode = generateSessionCode();
        
        const { data, error } = await supabaseClient
            .from('classroom_sessions')
            .insert([{
                ...sessionData,
                session_code: sessionCode,
                created_at: new Date().toISOString(),
                is_active: true
            }])
            .select();
        
        if (error) throw error;
        
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Create session error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Join a classroom session
 * @param {string} sessionCode - Session code
 * @param {string} studentId - Student ID
 * @returns {Promise} - Join result
 */
async function joinClassroomSession(sessionCode, studentId) {
    try {
        // Find active session
        const { data: session, error: sessionError } = await supabaseClient
            .from('classroom_sessions')
            .select('*')
            .eq('session_code', sessionCode)
            .eq('is_active', true)
            .single();
        
        if (sessionError) throw sessionError;
        
        // Add participant
        const { data, error } = await supabaseClient
            .from('session_participants')
            .insert([{
                session_id: session.id,
                student_id: studentId,
                joined_at: new Date().toISOString(),
                hand_raised: false
            }])
            .select();
        
        if (error) throw error;
        
        return { success: true, data: { session, participant: data[0] } };
    } catch (error) {
        console.error('Join session error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Toggle hand raise
 * @param {string} participantId - Participant ID
 * @param {boolean} raised - Hand raised status
 * @returns {Promise} - Update result
 */
async function toggleHandRaise(participantId, raised) {
    try {
        const { data, error } = await supabaseClient
            .from('session_participants')
            .update({ hand_raised: raised })
            .eq('id', participantId)
            .select();
        
        if (error) throw error;
        
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Toggle hand raise error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * End classroom session
 * @param {string} sessionId - Session ID
 * @returns {Promise} - Update result
 */
async function endClassroomSession(sessionId) {
    try {
        const { data, error } = await supabaseClient
            .from('classroom_sessions')
            .update({ 
                is_active: false,
                ended_at: new Date().toISOString()
            })
            .eq('id', sessionId)
            .select();
        
        if (error) throw error;
        
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('End session error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * ============================================
 * CHAT FUNCTIONS
 * ============================================
 */

/**
 * Send chat message
 * @param {Object} messageData - Message data
 * @returns {Promise} - Send result
 */
async function sendChatMessage(messageData) {
    try {
        const { data, error } = await supabaseClient
            .from('chat_messages')
            .insert([{
                ...messageData,
                sent_at: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Send message error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Get chat messages for a session
 * @param {string} sessionId - Session ID
 * @param {number} limit - Number of messages to fetch
 * @returns {Promise} - Messages data
 */
async function getChatMessages(sessionId, limit = 50) {
    try {
        const { data, error } = await supabaseClient
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('sent_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('Get messages error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Subscribe to chat messages
 * @param {string} sessionId - Session ID
 * @param {Function} callback - Callback function for new messages
 * @returns {Object} - Subscription object
 */
function subscribeToChat(sessionId, callback) {
    return supabaseClient
        .channel(`chat:${sessionId}`)
        .on('postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'chat_messages',
                filter: `session_id=eq.${sessionId}`
            }, 
            (payload) => {
                callback(payload.new);
            }
        )
        .subscribe();
}

/**
 * ============================================
 * WHITEBOARD FUNCTIONS
 * ============================================
 */

/**
 * Save whiteboard snapshot
 * @param {Object} snapshotData - Whiteboard data
 * @returns {Promise} - Save result
 */
async function saveWhiteboardSnapshot(snapshotData) {
    try {
        const { data, error } = await supabaseClient
            .from('whiteboard_snapshots')
            .insert([{
                ...snapshotData,
                saved_at: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Save whiteboard error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Get whiteboard snapshots for a session
 * @param {string} sessionId - Session ID
 * @returns {Promise} - Snapshots data
 */
async function getWhiteboardSnapshots(sessionId) {
    try {
        const { data, error } = await supabaseClient
            .from('whiteboard_snapshots')
            .select('*')
            .eq('session_id', sessionId)
            .order('saved_at', { ascending: false });
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('Get whiteboard snapshots error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Subscribe to whiteboard updates
 * @param {string} sessionId - Session ID
 * @param {Function} callback - Callback function for updates
 * @returns {Object} - Subscription object
 */
function subscribeToWhiteboard(sessionId, callback) {
    return supabaseClient
        .channel(`whiteboard:${sessionId}`)
        .on('postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'whiteboard_snapshots',
                filter: `session_id=eq.${sessionId}`
            }, 
            (payload) => {
                callback(payload.new);
            }
        )
        .subscribe();
}

/**
 * ============================================
 * ANALYTICS FUNCTIONS
 * ============================================
 */

/**
 * Get course analytics
 * @param {string} courseId - Course ID
 * @returns {Promise} - Analytics data
 */
async function getCourseAnalytics(courseId) {
    try {
        // Get total students
        const { data: enrollments, error: enrollError } = await supabaseClient
            .from('enrollments')
            .select('*', { count: 'exact' })
            .eq('course_id', courseId);
        
        if (enrollError) throw enrollError;
        
        // Get completed students
        const { data: completed, error: completeError } = await supabaseClient
            .from('enrollments')
            .select('*', { count: 'exact' })
            .eq('course_id', courseId)
            .eq('completed', true);
        
        if (completeError) throw completeError;
        
        // Get interactions
        const { data: interactions, error: interError } = await supabaseClient
            .from('interactions')
            .select('*')
            .eq('course_id', courseId);
        
        if (interError) throw interError;
        
        // Get responses
        const { data: responses, error: respError } = await supabaseClient
            .from('student_responses')
            .select('*, interactions(*)')
            .eq('interactions.course_id', courseId);
        
        if (respError) throw respError;
        
        // Calculate statistics
        const totalStudents = enrollments?.length || 0;
        const completedStudents = completed?.length || 0;
        const completionRate = totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0;
        
        // Calculate average score
        let totalScore = 0;
        let totalResponses = 0;
        responses.forEach(response => {
            if (response.is_correct !== null) {
                totalScore += response.is_correct ? 100 : 0;
                totalResponses++;
            }
        });
        const averageScore = totalResponses > 0 ? totalScore / totalResponses : 0;
        
        return {
            success: true,
            data: {
                totalStudents,
                completedStudents,
                completionRate,
                totalInteractions: interactions?.length || 0,
                totalResponses,
                averageScore,
                enrollments,
                interactions,
                responses
            }
        };
    } catch (error) {
        console.error('Get analytics error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * ============================================
 * UTILITY FUNCTIONS
 * ============================================
 */

/**
 * Generate a unique session code
 * @returns {string} - Session code
 */
function generateSessionCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} - Authentication status
 */
async function isAuthenticated() {
    const user = await getCurrentUser();
    return user.success && user.user !== null;
}

/**
 * Require authentication for pages
 * @param {string} redirectUrl - URL to redirect if not authenticated
 */
async function requireAuth(redirectUrl = 'index.html') {
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
        window.location.href = redirectUrl;
        return false;
    }
    
    return true;
}

/**
 * Handle authentication state changes
 */
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    
    switch (event) {
        case 'SIGNED_IN':
            // Save user to localStorage
            if (session?.user) {
                localStorage.setItem('user', JSON.stringify(session.user));
            }
            break;
            
        case 'SIGNED_OUT':
            // Clear user from localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('supabase.auth.token');
            break;
            
        case 'TOKEN_REFRESHED':
            console.log('Token refreshed');
            break;
            
        case 'USER_UPDATED':
            console.log('User updated');
            break;
    }
});

// Export functions for use in other files
window.supabase = {
    client: supabaseClient,
    auth: {
        signUp,
        signIn,
        signOut,
        getCurrentUser,
        resetPassword,
        updatePassword,
        isAuthenticated,
        requireAuth
    },
    courses: {
        create: createCourse,
        get: getCourse,
        getUserCourses,
        update: updateCourse,
        delete: deleteCourse
    },
    interactions: {
        create: createInteraction,
        getForCourse: getCourseInteractions,
        delete: deleteInteraction
    },
    enrollments: {
        enroll: enrollStudent,
        getProgress: getStudentProgress,
        updateProgress: updateProgress
    },
    responses: {
        save: saveStudentResponse,
        getForStudent: getStudentResponses
    },
    classroom: {
        createSession: createClassroomSession,
        joinSession: joinClassroomSession,
        endSession: endClassroomSession,
        toggleHandRaise,
        subscribeToChat,
        sendChatMessage,
        getChatMessages,
        saveWhiteboardSnapshot,
        getWhiteboardSnapshots,
        subscribeToWhiteboard
    },
    analytics: {
        getCourseAnalytics
    },
    utils: {
        generateSessionCode
    }
};

console.log('✅ Supabase client initialized successfully!');