const auth = {
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
            
            return { success: true, user: { ...data.user, profile } };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async signUp(email, password, fullName, role = 'student') {
        try {
            const { data, error } = await supabase.auth.signUp({
                email, password,
                options: { data: { full_name: fullName, role } }
            });
            if (error) throw error;
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async signOut() {
        await supabase.auth.signOut();
        window.location.href = '/';
    },

    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        return { ...user, profile };
    },

    async requireAuth(redirectTo = '/') {
        const user = await this.getCurrentUser();
        if (!user) window.location.href = redirectTo;
        return user;
    },

    async requireRole(role, redirectTo = '/') {
        const user = await this.getCurrentUser();
        if (!user || user.profile?.role !== role) {
            window.location.href = redirectTo;
            return null;
        }
        return user;
    }
};

window.auth = auth;