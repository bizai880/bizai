'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { CubeCanvas } from './components/CubeCanvas';
import { CubeLibrary } from './components/CubeLibrary';
import { CubeProperties } from './components/CubeProperties';
import { 
  createCube, 
  testCube, 
  deployCube,
  type CubeDefinition,
  type CubeCategory,
  type CubeInputSchema,
  type CubeOutputSchema
} from './actions';
import { Loader2, Plus, Play, Upload, Save, Eye, Code } from 'lucide-react';

export default function CubeBuilderPage() {
  const [activeTab, setActiveTab] = useState('design');
  const [isLoading, setIsLoading] = useState(false);
  const [cubes, setCubes] = useState<CubeDefinition[]>([]);
  const [selectedCube, setSelectedCube] = useState<CubeDefinition | null>(null);
  const [cubeName, setCubeName] = useState('');
  const [cubeDescription, setCubeDescription] = useState('');
  const [cubeCategory, setCubeCategory] = useState<CubeCategory>('custom');
  const [cubeTags, setCubeTags] = useState<string[]>([]);
  const [inputSchema, setInputSchema] = useState<CubeInputSchema>({
    type: 'object',
    properties: {},
    required: []
  });
  const [outputSchema, setOutputSchema] = useState<CubeOutputSchema>({
    type: 'object',
    properties: {}
  });
  const [testInput, setTestInput] = useState<string>('{}');
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    loadCubes();
  }, []);

  const loadCubes = async () => {
    try {
      const response = await fetch('/api/cubes');
      if (response.ok) {
        const data = await response.json();
        setCubes(data);
      }
    } catch (error) {
      console.error('Failed to load cubes:', error);
    }
  };

  const handleCreateCube = async () => {
    if (!cubeName.trim()) {
      toast.error('يرجى إدخال اسم المكعب');
      return;
    }

    setIsLoading(true);
    try {
      const newCube: CubeDefinition = {
        id: `cube_${Date.now()}`,
        name: cubeName,
        description: cubeDescription,
        category: cubeCategory,
        tags: cubeTags,
        inputSchema,
        outputSchema,
        version: '1.0.0',
        author: 'المستخدم الحالي',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await createCube(newCube);
      
      if (result.success) {
        toast.success('تم إنشاء المكعب بنجاح');
        setCubes([...cubes, result.cube]);
        setSelectedCube(result.cube);
        resetForm();
      } else {
        toast.error(result.error || 'فشل إنشاء المكعب');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إنشاء المكعب');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestCube = async () => {
    if (!selectedCube) {
      toast.error('يرجى اختيار مكعب للاختبار');
      return;
    }

    try {
      let inputData;
      try {
        inputData = JSON.parse(testInput);
      } catch {
        toast.error('تنسيق JSON غير صالح');
        return;
      }

      const result = await testCube(selectedCube.id, inputData);
      setTestResult(result);
      
      if (result.success) {
        toast.success('تم اختبار المكعب بنجاح');
      } else {
        toast.error('فشل اختبار المكعب: ' + result.error);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الاختبار');
      console.error(error);
    }
  };

  const handleDeployCube = async () => {
    if (!selectedCube) {
      toast.error('يرجى اختيار مكعب للنشر');
      return;
    }

    setIsLoading(true);
    try {
      const result = await deployCube(selectedCube.id);
      
      if (result.success) {
        toast.success('تم نشر المكعب بنجاح');
      } else {
        toast.error(result.error || 'فشل نشر المكعب');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء النشر');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCube = (cube: CubeDefinition) => {
    setSelectedCube(cube);
    setCubeName(cube.name);
    setCubeDescription(cube.description);
    setCubeCategory(cube.category);
    setCubeTags(cube.tags);
    setInputSchema(cube.inputSchema);
    setOutputSchema(cube.outputSchema);
  };

  const resetForm = () => {
    setCubeName('');
    setCubeDescription('');
    setCubeCategory('custom');
    setCubeTags([]);
    setInputSchema({
      type: 'object',
      properties: {},
      required: []
    });
    setOutputSchema({
      type: 'object',
      properties: {}
    });
    setTestInput('{}');
    setTestResult(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            مصمم المكعبات الذكية
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            صمم ونفذ مكعبات ذكاء اصطناعي قابلة لإعادة الاستخدام
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setActiveTab('library')}>
            <Eye className="w-4 h-4 ml-2" />
            عرض المكتبة
          </Button>
          <Button onClick={handleCreateCube} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 ml-2" />
            )}
            إنشاء مكعب جديد
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="design">🎨 التصميم</TabsTrigger>
          <TabsTrigger value="logic">⚙️ المنطق</TabsTrigger>
          <TabsTrigger value="test">🧪 الاختبار</TabsTrigger>
          <TabsTrigger value="deploy">🚀 النشر</TabsTrigger>
          <TabsTrigger value="library">📚 المكتبة</TabsTrigger>
        </TabsList>

        {/* تبويب التصميم */}
        <TabsContent value="design" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>لوحة التصميم</CardTitle>
                  <CardDescription>
                    اسحب وأفلت المكونات لبناء مكعبك
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CubeCanvas
                    cube={selectedCube}
                    onUpdate={(cube) => setSelectedCube(cube)}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>خصائص المكعب</CardTitle>
                </CardHeader>
                <CardContent>
                  <CubeProperties
                    cube={selectedCube}
                    onUpdate={handleSelectCube}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* تبويب المنطق */}
        <TabsContent value="logic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>مدخلات المكعب</CardTitle>
                <CardDescription>
                  حدد تنسيق البيانات المدخلة للمكعب
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input-schema">مخطط الإدخال (JSON Schema)</Label>
                  <Textarea
                    id="input-schema"
                    value={JSON.stringify(inputSchema, null, 2)}
                    onChange={(e) => {
                      try {
                        setInputSchema(JSON.parse(e.target.value));
                      } catch {
                        // تجاهل الأخطاء أثناء الكتابة
                      }
                    }}
                    rows={10}
                    className="font-mono text-sm"
                    dir="ltr"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newSchema: CubeInputSchema = {
                      type: 'object',
                      properties: {
                        input: {
                          type: 'string',
                          description: 'النص المدخل'
                        }
                      },
                      required: ['input']
                    };
                    setInputSchema(newSchema);
                  }}
                >
                  إضافة حقل نصي
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مخرجات المكعب</CardTitle>
                <CardDescription>
                  حدد تنسيق البيانات المخرجة من المكعب
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="output-schema">مخطط الإخراج (JSON Schema)</Label>
                  <Textarea
                    id="output-schema"
                    value={JSON.stringify(outputSchema, null, 2)}
                    onChange={(e) => {
                      try {
                        setOutputSchema(JSON.parse(e.target.value));
                      } catch {
                        // تجاهل الأخطاء أثناء الكتابة
                      }
                    }}
                    rows={10}
                    className="font-mono text-sm"
                    dir="ltr"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newSchema: CubeOutputSchema = {
                      type: 'object',
                      properties: {
                        result: {
                          type: 'string',
                          description: 'النتيجة'
                        }
                      }
                    };
                    setOutputSchema(newSchema);
                  }}
                >
                  إضافة حقل نتيجة
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تبويب الاختبار */}
        <TabsContent value="test" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إدخال الاختبار</CardTitle>
                <CardDescription>
                  أدخل بيانات اختبارية للمكعب
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-input">بيانات الاختبار (JSON)</Label>
                  <Textarea
                    id="test-input"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                    dir="ltr"
                    placeholder='{"input": "نص للاختبار"}'
                  />
                </div>
                <Button onClick={handleTestCube} className="w-full">
                  <Play className="w-4 h-4 ml-2" />
                  تشغيل الاختبار
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>نتيجة الاختبار</CardTitle>
                <CardDescription>
                  نتيجة تشغيل المكعب مع بيانات الاختبار
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">الحالة:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        testResult.success 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {testResult.success ? 'ناجح' : 'فاشل'}
                      </span>
                    </div>
                    
                    {testResult.data && (
                      <div>
                        <Label className="mb-2 block">البيانات المخرجة:</Label>
                        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto max-h-64">
                          {JSON.stringify(testResult.data, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {testResult.error && (
                      <div>
                        <Label className="mb-2 block text-red-600 dark:text-red-400">الخطأ:</Label>
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-red-700 dark:text-red-400 text-sm">
                          {testResult.error}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>وقت التنفيذ:</span>
                      <span>{testResult.executionTime} مللي ثانية</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Code className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>لم يتم تشغيل أي اختبار بعد</p>
                    <p className="text-sm mt-2">أدخل بيانات الاختبار واضغط على "تشغيل الاختبار"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تبويب النشر */}
        <TabsContent value="deploy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>نشر المكعب</CardTitle>
              <CardDescription>
                انشر المكعب إلى ModelHub للاستخدام في أنظمة أخرى
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedCube ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>اسم المكعب</Label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        {selectedCube.name}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>الفئة</Label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        {selectedCube.category}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>الإصدار</Label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        {selectedCube.version}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>الحالة</Label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        {selectedCube.isActive ? 'نشط' : 'غير نشط'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>الوصف</Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      {selectedCube.description || 'لا يوجد وصف'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>الوسوم</Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      {selectedCube.tags.length > 0 ? (
                        selectedCube.tags.map(tag => (
                          <span 
                            key={tag}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">لا توجد وسوم</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">النشر العام</h4>
                      <p className="text-sm text-gray-500">سيصبح المكعب متاحاً للجميع</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">التسعير</h4>
                      <p className="text-sm text-gray-500">حدد سعراً لكل 1000 طلب</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="w-24"
                        defaultValue="0"
                      />
                      <span className="text-gray-500">$</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="outline" onClick={() => toast.info('تم حفظ المسودة')}>
                      <Save className="w-4 h-4 ml-2" />
                      حفظ كمسودة
                    </Button>
                    <Button onClick={handleDeployCube} disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 ml-2" />
                      )}
                      نشر المكعب
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">لم تقم باختيار أي مكعب للنشر</p>
                  <Button variant="outline" onClick={() => setActiveTab('library')}>
                    تصفح المكتبة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب المكتبة */}
        <TabsContent value="library">
          <CubeLibrary
            cubes={cubes}
            selectedCube={selectedCube}
            onSelectCube={handleSelectCube}
            onRefresh={loadCubes}
          />
        </TabsContent>
      </Tabs>

      {/* نموذج إنشاء مكعب جديد */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>إنشاء مكعب جديد</CardTitle>
          <CardDescription>
            ابدأ بإنشاء مكعب ذكي جديد
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cube-name">اسم المكعب *</Label>
              <Input
                id="cube-name"
                placeholder="مثل: تحليل المشاعر العربي"
                value={cubeName}
                onChange={(e) => setCubeName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cube-category">الفئة</Label>
              <Select value={cubeCategory} onValueChange={(value: CubeCategory) => setCubeCategory(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر فئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vision">👁️ الرؤية الحاسوبية</SelectItem>
                  <SelectItem value="nlp">💬 معالجة اللغة</SelectItem>
                  <SelectItem value="data">📊 تحليل البيانات</SelectItem>
                  <SelectItem value="integration">🔗 التكامل</SelectItem>
                  <SelectItem value="custom">🎨 مخصص</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cube-description">الوصف</Label>
            <Textarea
              id="cube-description"
              placeholder="صف وظيفة المكعب وما يقدمه..."
              value={cubeDescription}
              onChange={(e) => setCubeDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>الوسوم</Label>
            <Input
              placeholder="أضف وسوماً مفصولة بفاصلة (مثل: عربي, مشاعر, تحليل)"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  e.preventDefault();
                  const newTag = e.currentTarget.value.trim();
                  if (!cubeTags.includes(newTag)) {
                    setCubeTags([...cubeTags, newTag]);
                  }
                  e.currentTarget.value = '';
                }
              }}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {cubeTags.map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setCubeTags(cubeTags.filter(t => t !== tag))}
                    className="mr-2 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}