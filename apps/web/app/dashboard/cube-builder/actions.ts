'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// أنواع البيانات
export type CubeCategory = 'vision' | 'nlp' | 'data' | 'integration' | 'custom';

export interface CubeInputSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, any>;
  items?: any;
  required?: string[];
  description?: string;
  [key: string]: any;
}

export interface CubeOutputSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, any>;
  items?: any;
  description?: string;
  [key: string]: any;
}

export interface CubeDefinition {
  id: string;
  name: string;
  description: string;
  category: CubeCategory;
  tags: string[];
  inputSchema: CubeInputSchema;
  outputSchema: CubeOutputSchema;
  version: string;
  author: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    executionTime?: number;
    memoryUsage?: number;
    pricePer1000?: number;
    requiresGPU?: boolean;
    [key: string]: any;
  };
  workflow?: any[];
  connections?: any[];
}

export interface CubeExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  cached: boolean;
}

export interface CubeOperationResult {
  success: boolean;
  cube?: CubeDefinition;
  result?: CubeExecutionResult;
  error?: string;
}

// إنشاء مكعب جديد
export async function createCube(cube: CubeDefinition): Promise<CubeOperationResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cubes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(cube)
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `فشل إنشاء المكعب: ${error}`
      };
    }

    const createdCube = await response.json();
    
    // إعادة تحميل البيانات
    revalidatePath('/dashboard/cube-builder');
    
    return {
      success: true,
      cube: createdCube
    };
  } catch (error) {
    console.error('Error creating cube:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ غير معروف'
    };
  }
}

// تحديث مكعب موجود
export async function updateCube(cubeId: string, updates: Partial<CubeDefinition>): Promise<CubeOperationResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cubes/${cubeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...updates,
        updatedAt: new Date()
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `فشل تحديث المكعب: ${error}`
      };
    }

    const updatedCube = await response.json();
    
    // إعادة تحميل البيانات
    revalidatePath('/dashboard/cube-builder');
    revalidatePath(`/dashboard/cube-builder/${cubeId}`);
    
    return {
      success: true,
      cube: updatedCube
    };
  } catch (error) {
    console.error('Error updating cube:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ غير معروف'
    };
  }
}

// حذف مكعب
export async function deleteCube(cubeId: string): Promise<CubeOperationResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cubes/${cubeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `فشل حذف المكعب: ${error}`
      };
    }

    // إعادة تحميل البيانات
    revalidatePath('/dashboard/cube-builder');
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting cube:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ غير معروف'
    };
  }
}

// اختبار مكعب
export async function testCube(cubeId: string, inputData: any): Promise<CubeExecutionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    const startTime = Date.now();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cubes/${cubeId}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ data: inputData })
    });

    const executionTime = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `فشل اختبار المكعب: ${error}`,
        executionTime,
        cached: false
      };
    }

    const result = await response.json();
    
    return {
      success: true,
      data: result.data,
      executionTime,
      cached: result.cached || false
    };
  } catch (error) {
    console.error('Error testing cube:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ غير معروف',
      executionTime: 0,
      cached: false
    };
  }
}

// نشر مكعب إلى ModelHub
export async function deployCube(cubeId: string): Promise<CubeOperationResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cubes/${cubeId}/deploy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `فشل نشر المكعب: ${error}`
      };
    }

    const result = await response.json();
    
    // إعادة تحميل البيانات
    revalidatePath('/dashboard/cube-builder');
    
    return {
      success: true,
      result: result
    };
  } catch (error) {
    console.error('Error deploying cube:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ غير معروف'
    };
  }
}

// استيراد مكعب من ملف JSON
export async function importCube(file: File): Promise<CubeOperationResult> {
  try {
    const text = await file.text();
    const cubeData = JSON.parse(text);

    // التحقق من البيانات
    if (!cubeData.name || !cubeData.category) {
      return {
        success: false,
        error: 'ملف غير صالح. يجب أن يحتوي على اسم وفئة للمكعب.'
      };
    }

    const cube: CubeDefinition = {
      id: `imported_${Date.now()}`,
      name: cubeData.name,
      description: cubeData.description || '',
      category: cubeData.category,
      tags: cubeData.tags || [],
      inputSchema: cubeData.inputSchema || { type: 'object', properties: {}, required: [] },
      outputSchema: cubeData.outputSchema || { type: 'object', properties: {} },
      version: cubeData.version || '1.0.0',
      author: 'مستورد',
      isActive: cubeData.isActive !== undefined ? cubeData.isActive : false,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: cubeData.metadata
    };

    return await createCube(cube);
  } catch (error) {
    console.error('Error importing cube:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'فشل قراءة الملف'
    };
  }
}

// جلب جميع المكعبات
export async function getAllCubes(): Promise<CubeDefinition[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cubes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      next: { tags: ['cubes'] }
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching cubes:', error);
    return [];
  }
}

// جلب مكعب محدد
export async function getCube(cubeId: string): Promise<CubeDefinition | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cubes/${cubeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching cube:', error);
    return null;
  }
}

// البحث في المكعبات
export async function searchCubes(query: string, category?: CubeCategory): Promise<CubeDefinition[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/cubes/search`);
    url.searchParams.append('q', query);
    if (category) {
      url.searchParams.append('category', category);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching cubes:', error);
    return [];
  }
}

// توليد كود المكعب
export async function generateCubeCode(cube: CubeDefinition, language: 'python' | 'javascript' | 'typescript'): Promise<string> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cubes/generate-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ cube, language })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const result = await response.json();
    return result.code;
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
}

// نسخ مكعب
export async function duplicateCube(cubeId: string, newName: string): Promise<CubeOperationResult> {
  try {
    const originalCube = await getCube(cubeId);
    if (!originalCube) {
      return {
        success: false,
        error: 'المكعب غير موجود'
      };
    }

    const duplicatedCube: CubeDefinition = {
      ...originalCube,
      id: `copy_${cubeId}_${Date.now()}`,
      name: newName,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await createCube(duplicatedCube);
  } catch (error) {
    console.error('Error duplicating cube:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ غير معروف'
    };
  }
}