import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyToken, encryptionService } from '@/lib/crypto/encryption'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = verifyToken(request)
    const userId = params.id
    
    const supabase = await createClient()
    
    // التحقق من الصلاحيات
    if (currentUser.role !== 'admin' && currentUser.userId !== userId) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 403 }
      )
    }
    
    // جلب بيانات المستخدم
    const { data: user, error } = await supabase
      .from('profiles')
      .select(`
        *,
        encrypted_profiles!inner(data),
        activity_logs(
          action,
          details,
          created_at
        ),
        generation_requests(
          id,
          template_type,
          status,
          created_at
        )
      `)
      .eq('id', userId)
      .single()
    
    if (error) throw error
    
    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }
    
    // فك تشفير البيانات الحساسة
    let sensitiveData = {}
    try {
      const encryptedData = user.encrypted_profiles?.[0]?.data
      if (encryptedData) {
        sensitiveData = encryptionService.decryptData(encryptedData)
      }
    } catch {
      // تجاهل خطأ فك التشفير
    }
    
    // إحصائيات المستخدم
    const { data: stats } = await supabase
      .from('generation_requests')
      .select('status', { count: 'exact' })
      .eq('user_id', userId)
    
    const userStats = {
      total_requests: stats?.length || 0,
      completed_requests: stats?.filter(s => s.status === 'completed').length || 0,
      pending_requests: stats?.filter(s => s.status === 'pending').length || 0
    }
    
    const responseData = {
      ...user,
      encrypted_profiles: undefined,
      sensitive_data: sensitiveData,
      stats: userStats
    }
    
    return NextResponse.json({
      success: true,
      data: responseData
    })
    
  } catch (error: any) {
    console.error('Get user error:', error)
    
    return NextResponse.json(
      { error: error.message || 'فشل في جلب بيانات المستخدم' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = verifyToken(request)
    const userId = params.id
    const body = await request.json()
    
    const supabase = await createClient()
    
    // التحقق من الصلاحيات
    if (currentUser.role !== 'admin' && currentUser.userId !== userId) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 403 }
      )
    }
    
    // تحديث البيانات الأساسية
    const updateData: any = {}
    
    if (body.full_name) updateData.full_name = body.full_name
    if (body.role && currentUser.role === 'admin') updateData.role = body.role
    if (body.subscription && currentUser.role === 'admin') {
      updateData.subscription = body.subscription
    }
    
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
      
      if (updateError) throw updateError
    }
    
    // تحديث البيانات المشفرة
    if (body.sensitive_data) {
      const { data: existing } = await supabase
        .from('encrypted_profiles')
        .select('data')
        .eq('user_id', userId)
        .single()
      
      let encryptedData
      
      if (existing?.data) {
        try {
          const currentData = encryptionService.decryptData(existing.data)
          encryptedData = encryptionService.encryptData({
            ...currentData,
            ...body.sensitive_data
          })
        } catch {
          encryptedData = encryptionService.encryptData(body.sensitive_data)
        }
      } else {
        encryptedData = encryptionService.encryptData(body.sensitive_data)
      }
      
      const { error: encryptError } = await supabase
        .from('encrypted_profiles')
        .upsert({
          user_id: userId,
          data: encryptedData,
          updated_at: new Date().toISOString()
        })
      
      if (encryptError) throw encryptError
    }
    
    // تسجيل النشاط
    await supabase.from('activity_logs').insert({
      user_id: currentUser.userId,
      action: 'USER_UPDATED',
      resource_type: 'user',
      resource_id: userId,
      details: {
        updated_fields: Object.keys(body)
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات المستخدم بنجاح'
    })
    
  } catch (error: any) {
    console.error('Update user error:', error)
    
    return NextResponse.json(
      { error: error.message || 'فشل في تحديث المستخدم' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireRole('admin')(request)
    const userId = params.id
    const currentUserId = request.headers.get('x-user-id')
    
    // منع حذف النفس
    if (userId === currentUserId) {
      return NextResponse.json(
        { error: 'لا يمكنك حذف حسابك الخاص' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // حذف المستخدم من Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    
    if (authError) throw authError
    
    // تسجيل النشاط
    await supabase.from('activity_logs').insert({
      user_id: currentUserId,
      action: 'USER_DELETED',
      resource_type: 'user',
      resource_id: userId
    })
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    })
    
  } catch (error: any) {
    console.error('Delete user error:', error)
    
    return NextResponse.json(
      { error: error.message || 'فشل في حذف المستخدم' },
      { status: 500 }
    )
  }
}
