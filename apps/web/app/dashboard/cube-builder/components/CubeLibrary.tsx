'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  RefreshCw,
  Star,
  Eye,
  Download,
  Copy,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CubeDefinition } from '../actions';

interface CubeLibraryProps {
  cubes: CubeDefinition[];
  selectedCube: CubeDefinition | null;
  onSelectCube: (cube: CubeDefinition) => void;
  onRefresh: () => void;
}

const categoryIcons = {
  vision: '👁️',
  nlp: '💬',
  data: '📊',
  integration: '🔗',
  custom: '🎨'
};

const categoryColors = {
  vision: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  nlp: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  data: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  integration: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};

export function CubeLibrary({ cubes, selectedCube, onSelectCube, onRefresh }: CubeLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'popularity'>('date');

  const filteredCubes = cubes.filter(cube => {
    const matchesSearch = cube.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cube.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cube.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || cube.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedCubes = [...filteredCubes].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'popularity':
        // يمكن إضافة منطق الشعبية لاحقاً
        return 0;
      default:
        return 0;
    }
  });

  const categories = [
    { id: 'all', label: 'الكل', count: cubes.length },
    { id: 'vision', label: 'الرؤية', count: cubes.filter(c => c.category === 'vision').length },
    { id: 'nlp', label: 'اللغة', count: cubes.filter(c => c.category === 'nlp').length },
    { id: 'data', label: 'البيانات', count: cubes.filter(c => c.category === 'data').length },
    { id: 'integration', label: 'التكامل', count: cubes.filter(c => c.category === 'integration').length },
    { id: 'custom', label: 'مخصص', count: cubes.filter(c => c.category === 'custom').length }
  ];

  const handleCopyCube = (cube: CubeDefinition) => {
    const copy = {
      ...cube,
      id: `copy_${cube.id}_${Date.now()}`,
      name: `${cube.name} (نسخة)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    onSelectCube(copy);
  };

  const handleDownloadCube = (cube: CubeDefinition) => {
    const dataStr = JSON.stringify(cube, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${cube.name.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      {/* شريط البحث والتصفية */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="ابحث عن مكعب بالاسم، الوصف، أو الوسوم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">ترتيب حسب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border rounded px-2 py-1 text-sm"
            >
              <option value="date">الأحدث</option>
              <option value="name">الاسم</option>
              <option value="popularity">الشعبية</option>
            </select>
          </div>
          
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* فئات التصفية */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.id !== 'all' && categoryIcons[category.id as keyof typeof categoryIcons]}
            {category.label}
            <Badge variant="secondary" className="mr-2">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* شبكة المكعبات */}
      {sortedCubes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">لم يتم العثور على مكعبات</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'لا توجد مكعبات تطابق بحثك'
                : 'لا توجد مكعبات متاحة بعد'}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                مسح البحث
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCubes.map(cube => (
            <Card 
              key={cube.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedCube?.id === cube.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : ''
              }`}
              onClick={() => onSelectCube(cube)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">
                        {categoryIcons[cube.category]}
                      </span>
                      <h3 className="font-semibold text-lg">{cube.name}</h3>
                    </div>
                    
                    <Badge className={`${categoryColors[cube.category]} mb-3`}>
                      {cube.category === 'vision' && 'رؤية حاسوبية'}
                      {cube.category === 'nlp' && 'معالجة لغة'}
                      {cube.category === 'data' && 'تحليل بيانات'}
                      {cube.category === 'integration' && 'تكامل'}
                      {cube.category === 'custom' && 'مخصص'}
                    </Badge>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCube(cube);
                      }}>
                        <Copy className="w-4 h-4 ml-2" />
                        نسخ المكعب
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadCube(cube);
                      }}>
                        <Download className="w-4 h-4 ml-2" />
                        تحميل كـ JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Eye className="w-4 h-4 ml-2" />
                        معاينة التفاصيل
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {cube.description || 'لا يوجد وصف'}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {cube.tags.slice(0, 3).map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {cube.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs text-gray-500">
                      +{cube.tags.length - 3} أكثر
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Star className="w-3 h-3 ml-1 fill-current" />
                      {cube.version}
                    </span>
                    <span>{cube.author}</span>
                  </div>
                  <div>
                    {new Date(cube.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      cube.isActive 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`} />
                    <span className="text-xs">
                      {cube.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCube(cube);
                    }}
                  >
                    <Eye className="w-3 h-3 ml-2" />
                    تفاصيل
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* إحصائيات */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{cubes.length}</div>
              <div className="text-sm text-gray-500">إجمالي المكعبات</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {cubes.filter(c => c.isActive).length}
              </div>
              <div className="text-sm text-gray-500">مكعبات نشطة</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {cubes.filter(c => c.category === 'ai').length}
              </div>
              <div className="text-sm text-gray-500">ذكاء اصطناعي</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {new Set(cubes.flatMap(c => c.tags)).size}
              </div>
              <div className="text-sm text-gray-500">وسوم مختلفة</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}