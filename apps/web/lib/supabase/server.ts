// Supabase server stub for build
export function createServerClient() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      }),
      insert: () => ({
        select: () => Promise.resolve({ data: null, error: null })
      }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    })
  };
}

export function createClient() {
  return createServerClient();
}

export const supabase = createServerClient();
