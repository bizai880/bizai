-- supabase/migrations/001_auth_schema.sql

-- التحقق من وجود الجداول قبل الإنشاء
DO $$ 
BEGIN
  -- جدول الملفات الشخصية
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
      subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'pro', 'enterprise')),
      phone TEXT,
      company TEXT,
      job_title TEXT,
      country TEXT,
      timezone TEXT DEFAULT 'Asia/Dubai',
      last_sign_in_at TIMESTAMPTZ,
      email_verified BOOLEAN DEFAULT FALSE,
      two_factor_enabled BOOLEAN DEFAULT FALSE,
      settings JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- تعليق على الجدول
    COMMENT ON TABLE profiles IS 'ملفات تعريف المستخدمين المرتبطة بحسابات المصادقة';
  END IF;
  
  -- جدول الصلاحيات
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'role_permissions') THEN
    CREATE TABLE role_permissions (
      id SERIAL PRIMARY KEY,
      role TEXT NOT NULL,
      permission TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(role, permission)
    );
    
    COMMENT ON TABLE role_permissions IS 'الصلاحيات المرتبطة بكل دور';
  END IF;
  
  -- جدول جلسات المستخدم
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_sessions') THEN
    CREATE TABLE user_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      device_info JSONB,
      ip_address INET,
      last_activity TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
  
  -- جدول سجل النشاط
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activity_logs') THEN
    CREATE TABLE activity_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id UUID,
      details JSONB,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
  
  -- جدول الإشعارات
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    CREATE TABLE notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data JSONB DEFAULT '{}'::jsonb,
      read BOOLEAN DEFAULT FALSE,
      important BOOLEAN DEFAULT FALSE,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    COMMENT ON TABLE notifications IS 'إشعارات النظام للمستخدمين';
  END IF;
  
  -- جدول الطلبات
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'generation_requests') THEN
    CREATE TABLE generation_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      template_type TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
      result_url TEXT,
      metadata JSONB,
      error TEXT,
      ai_model_used TEXT,
      processing_time INTEGER,
      tokens_used INTEGER,
      cost DECIMAL(10, 6),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    );
    
    COMMENT ON TABLE generation_requests IS 'طلبات توليد المحتوى بواسطة الذكاء الاصطناعي';
  END IF;
END $$;

-- إنشاء الفهارس (مع التحقق من وجودها)
DO $$ 
BEGIN
  -- فهارس profiles
  IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_profiles_email') THEN
    CREATE INDEX idx_profiles_email ON profiles(email);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_profiles_role') THEN
    CREATE INDEX idx_profiles_role ON profiles(role);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_profiles_subscription') THEN
    CREATE INDEX idx_profiles_subscription ON profiles(subscription);
  END IF;
  
  -- فهارس notifications
  IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_notifications_user') THEN
    CREATE INDEX idx_notifications_user ON notifications(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_notifications_read') THEN
    CREATE INDEX idx_notifications_read ON notifications(read);
  END IF;
  
  -- فهارس activity_logs
  IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_activity_logs_user') THEN
    CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
  END IF;
  
  -- فهارس generation_requests
  IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_generation_requests_user') THEN
    CREATE INDEX idx_generation_requests_user ON generation_requests(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_generation_requests_status') THEN
    CREATE INDEX idx_generation_requests_status ON generation_requests(status);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_generation_requests_created') THEN
    CREATE INDEX idx_generation_requests_created ON generation_requests(created_at);
  END IF;
END $$;

-- إدخال بيانات الصلاحيات (مع التحقق من عدم التكرار)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM role_permissions WHERE role = 'admin' AND permission = 'users.manage') THEN
    INSERT INTO role_permissions (role, permission) VALUES
      ('admin', 'users.manage'),
      ('admin', 'settings.manage'),
      ('admin', 'notifications.manage'),
      ('admin', 'reports.view'),
      ('moderator', 'users.view'),
      ('moderator', 'notifications.send'),
      ('user', 'profile.manage'),
      ('user', 'requests.create');
  END IF;
END $$;

-- 🔐 حذف الدوال القديمة إذا كانت موجودة وإعادة إنشائها
DROP FUNCTION IF EXISTS get_user_role(uuid) CASCADE;
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$;

DROP FUNCTION IF EXISTS has_permission(uuid, text) CASCADE;
CREATE OR REPLACE FUNCTION has_permission(user_id uuid, required_permission text)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN role_permissions rp ON p.role = rp.role
    WHERE p.id = user_id 
      AND rp.permission = required_permission
  );
$$;

DROP FUNCTION IF EXISTS current_user_id() CASCADE;
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT auth.uid();
$$;

DROP FUNCTION IF EXISTS is_admin(uuid) CASCADE;
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

DROP FUNCTION IF EXISTS get_teams_for_user(uuid) CASCADE;
CREATE OR REPLACE FUNCTION get_teams_for_user(user_uuid uuid)
RETURNS TABLE(team_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  -- هذه دالة مثالية، عدلها حسب هيكل قاعدة البيانات الخاص بك
  -- حالياً ترجع جدولاً فارغاً لأن ليس لديك جدول فرق بعد
  SELECT NULL::uuid WHERE FALSE;
$$;

COMMENT ON FUNCTION get_teams_for_user(uuid) IS 
'الدالة التي واجهت مشكلة معها. حالياً ترجع جدولاً فارغاً لأن ليس لديك جدول فرق بعد. 
أضف جدول الفرق أولاً ثم عدل الدالة لتعكس هيكل جدولك.';

-- تمكين RLS (مع التحقق إذا كان مفعلاً بالفعل)
DO $$ 
BEGIN
  -- profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND rowsecurity = true
  ) THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- notifications
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'notifications' AND rowsecurity = true
  ) THEN
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- generation_requests
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'generation_requests' AND rowsecurity = true
  ) THEN
    ALTER TABLE generation_requests ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- activity_logs
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'activity_logs' AND rowsecurity = true
  ) THEN
    ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- user_sessions
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'user_sessions' AND rowsecurity = true
  ) THEN
    ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- role_permissions
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'role_permissions' AND rowsecurity = true
  ) THEN
    ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- حذف السياسات القديمة وإنشاء الجديدة
DO $$ 
BEGIN
  -- سياسات profiles
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);
  
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);
  
  DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
  CREATE POLICY "Admins can view all profiles" 
    ON profiles FOR SELECT 
    USING (is_admin(auth.uid()));
  
  -- سياسات notifications
  DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
  CREATE POLICY "Users can view own notifications" 
    ON notifications FOR SELECT 
    USING (user_id = auth.uid());
  
  DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
  CREATE POLICY "Users can update own notifications" 
    ON notifications FOR UPDATE 
    USING (user_id = auth.uid());
  
  -- سياسات generation_requests
  DROP POLICY IF EXISTS "Users can view own requests" ON generation_requests;
  CREATE POLICY "Users can view own requests" 
    ON generation_requests FOR SELECT 
    USING (user_id = auth.uid());
  
  DROP POLICY IF EXISTS "Users can create requests" ON generation_requests;
  CREATE POLICY "Users can create requests" 
    ON generation_requests FOR INSERT 
    WITH CHECK (user_id = auth.uid());
  
  -- سياسات activity_logs
  DROP POLICY IF EXISTS "Admins can view all activity logs" ON activity_logs;
  CREATE POLICY "Admins can view all activity logs" 
    ON activity_logs FOR SELECT 
    USING (is_admin(auth.uid()));
  
  -- سياسات user_sessions
  DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
  CREATE POLICY "Users can view own sessions" 
    ON user_sessions FOR SELECT 
    USING (user_id = auth.uid());
  
  DROP POLICY IF EXISTS "Users can delete own sessions" ON user_sessions;
  CREATE POLICY "Users can delete own sessions" 
    ON user_sessions FOR DELETE 
    USING (user_id = auth.uid());
  
  -- سياسات role_permissions
  DROP POLICY IF EXISTS "Admins can view permissions" ON role_permissions;
  CREATE POLICY "Admins can view permissions" 
    ON role_permissions FOR SELECT 
    USING (is_admin(auth.uid()));
END $$;

-- حذف الدوال القديمة وإعادة إنشائها
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::text, 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS log_activity() CASCADE;
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
  current_user_uuid uuid;
BEGIN
  -- الحصول على المستخدم الحالي
  current_user_uuid := auth.uid();
  
  -- إذا لم يكن هناك مستخدم (في حالة العمليات النظامية)
  IF current_user_uuid IS NULL THEN
    RETURN NEW;
  END IF;
  
  INSERT INTO activity_logs (
    user_id, 
    action, 
    resource_type, 
    resource_id, 
    details
  )
  VALUES (
    current_user_uuid,
    TG_OP,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id 
      ELSE NEW.id 
    END,
    jsonb_build_object(
      'old', CASE 
        WHEN TG_OP IN ('UPDATE', 'DELETE') AND OLD IS NOT NULL 
        THEN to_jsonb(OLD) 
        ELSE '{}'::jsonb 
      END,
      'new', CASE 
        WHEN TG_OP IN ('INSERT', 'UPDATE') AND NEW IS NOT NULL 
        THEN to_jsonb(NEW) 
        ELSE '{}'::jsonb 
      END,
      'timestamp', NOW()
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS upgrade_to_pro(uuid) CASCADE;
CREATE OR REPLACE FUNCTION upgrade_to_pro(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- التحقق من أن المستخدم يقوم بترقية نفسه فقط أو أن المستخدم الحالي مشرف
  IF user_id != auth.uid() AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'ليس لديك الصلاحية لترقية مستخدم آخر';
  END IF;
  
  UPDATE profiles 
  SET 
    subscription = 'pro',
    updated_at = NOW()
  WHERE id = user_id;
  
  -- تسجيل النشاط
  INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details)
  VALUES (
    COALESCE(auth.uid(), user_id),
    'UPGRADE',
    'profiles',
    user_id,
    jsonb_build_object('from', 'free', 'to', 'pro', 'upgraded_by', auth.uid())
  );
END;
$$;

-- حذف المشغلات القديمة وإعادة إنشائها
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_requests_updated_at ON generation_requests;
CREATE TRIGGER update_requests_updated_at 
  BEFORE UPDATE ON generation_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS log_profile_changes ON profiles;
CREATE TRIGGER log_profile_changes
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION log_activity();

DROP TRIGGER IF EXISTS log_request_changes ON generation_requests;
CREATE TRIGGER log_request_changes
  AFTER INSERT OR UPDATE OR DELETE ON generation_requests
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- حذف المنظر القديم وإعادة إنشائه
DROP VIEW IF EXISTS public.user_profiles CASCADE;
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.avatar_url,
  p.role,
  p.subscription,
  p.created_at,
  -- إحصائيات المستخدم
  (SELECT COUNT(*) FROM generation_requests gr WHERE gr.user_id = p.id) as total_requests,
  (SELECT COUNT(*) FROM notifications n WHERE n.user_id = p.id AND NOT n.read) as unread_notifications,
  (SELECT COUNT(*) FROM user_sessions us WHERE us.user_id = p.id) as active_sessions
FROM profiles p
WHERE 
  -- يمكن للمستخدم رؤية نفسه فقط ما لم يكن مشرفاً
  p.id = auth.uid() OR is_admin(auth.uid());

-- منح الصلاحيات
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.user_profiles TO authenticated;

-- تعليقات إضافية للتوثيق
COMMENT ON COLUMN profiles.email IS 'البريد الإلكتروني للمستخدم (يجب أن يكون فريداً)';
COMMENT ON COLUMN profiles.role IS 'دور المستخدم في النظام: admin, moderator, user';
COMMENT ON COLUMN profiles.subscription IS 'نوع الاشتراك: free, pro, enterprise';
COMMENT ON COLUMN generation_requests.status IS 'حالة الطلب: pending, processing, completed, failed';
COMMENT ON COLUMN notifications.type IS 'نوع الإشعار: info, success, warning, error';
COMMENT ON FUNCTION is_admin(uuid) IS 'ترجع true إذا كان المستخدم مشرفاً';
COMMENT ON FUNCTION has_permission(uuid, text) IS 'ترجع true إذا كان المستخدم لديه الصلاحية المطلوبة';

-- وظيفة مساعدة لإنشاء مستخدم تجريبي (للتطوير فقط)
CREATE OR REPLACE FUNCTION create_test_user(
  user_email TEXT,
  user_role TEXT DEFAULT 'user',
  user_subscription TEXT DEFAULT 'free'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- للاستخدام في التطوير فقط
  IF current_setting('app.env') != 'development' THEN
    RAISE EXCEPTION 'هذه الوظيفة للاستخدام في بيئة التطوير فقط';
  END IF;
  
  -- إنشاء مستخدم في auth (هذا مثال، في الواقع تحتاج إلى استخدام auth.admin API)
  new_user_id := gen_random_uuid();
  
  -- إنشاء ملف التعريف
  INSERT INTO profiles (id, email, role, subscription)
  VALUES (new_user_id, user_email, user_role, user_subscription);
  
  RETURN new_user_id;
END;
$$;

-- إضافة سياسة للقراءة العامة لبعض البيانات (اختياري)
DROP POLICY IF EXISTS "Public can view user counts" ON profiles;
CREATE POLICY "Public can view user counts" 
  ON profiles FOR SELECT 
  USING (
    -- السماح برؤية الإحصائيات العامة فقط
    false  -- غير مفعل حالياً، يمكنك تغييره حسب احتياجاتك
  );

-- إضافة عمود soft delete إذا أردت
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE generation_requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- وظيفة soft delete
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- وظيفة استعادة soft delete
CREATE OR REPLACE FUNCTION restore_record(table_name TEXT, record_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('
    UPDATE %I 
    SET deleted_at = NULL 
    WHERE id = $1 AND deleted_at IS NOT NULL
  ', table_name) USING record_id;
  
  RETURN FOUND;
END;
$$;

-- تسجيل نسخة من هذا الملف في سجل التعديلات
INSERT INTO activity_logs (action, resource_type, details)
VALUES (
  'MIGRATION',
  'schema',
  jsonb_build_object(
    'migration_file', '001_auth_schema.sql',
    'executed_at', NOW(),
    'version', '1.0.0'
  )
) ON CONFLICT DO NOTHING;