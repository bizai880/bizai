'use client';

import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  ReactFlowInstance,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  Handle,
  Position,
  ConnectionMode
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Trash2, 
  Move, 
  Code, 
  Database, 
  Eye, 
  Cpu,
  Upload,
  Download
} from 'lucide-react';
import { CubeDefinition } from '../actions';

// أنواع العقد المخصصة
interface CubeNodeData {
  label: string;
  type: 'input' | 'output' | 'process' | 'ai' | 'data';
  config?: any;
}

const nodeTypes: NodeTypes = {
  inputNode: ({ data }: { data: CubeNodeData }) => (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white dark:bg-gray-800 border-2 border-green-500">
      <Handle type="source" position={Position.Right} />
      <div className="flex items-center space-x-2">
        <Upload className="w-4 h-4 text-green-500" />
        <div>
          <div className="font-medium">{data.label}</div>
          <div className="text-xs text-gray-500">مدخل</div>
        </div>
      </div>
    </div>
  ),
  
  outputNode: ({ data }: { data: CubeNodeData }) => (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white dark:bg-gray-800 border-2 border-blue-500">
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center space-x-2">
        <Download className="w-4 h-4 text-blue-500" />
        <div>
          <div className="font-medium">{data.label}</div>
          <div className="text-xs text-gray-500">مخرج</div>
        </div>
      </div>
    </div>
  ),
  
  processNode: ({ data }: { data: CubeNodeData }) => (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white dark:bg-gray-800 border-2 border-yellow-500">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div className="flex items-center space-x-2">
        <Cpu className="w-4 h-4 text-yellow-500" />
        <div>
          <div className="font-medium">{data.label}</div>
          <div className="text-xs text-gray-500">معالجة</div>
        </div>
      </div>
    </div>
  ),
  
  aiNode: ({ data }: { data: CubeNodeData }) => (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white dark:bg-gray-800 border-2 border-purple-500">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div className="flex items-center space-x-2">
        <Code className="w-4 h-4 text-purple-500" />
        <div>
          <div className="font-medium">{data.label}</div>
          <div className="text-xs text-gray-500">ذكاء اصطناعي</div>
        </div>
      </div>
    </div>
  ),
  
  dataNode: ({ data }: { data: CubeNodeData }) => (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-500">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div className="flex items-center space-x-2">
        <Database className="w-4 h-4 text-gray-500" />
        <div>
          <div className="font-medium">{data.label}</div>
          <div className="text-xs text-gray-500">بيانات</div>
        </div>
      </div>
    </div>
  )
};

interface CubeCanvasProps {
  cube: CubeDefinition | null;
  onUpdate: (cube: CubeDefinition) => void;
}

export function CubeCanvas({ cube, onUpdate }: CubeCanvasProps) {
  const [nodes, setNodes] = useState<Node<CubeNodeData>[]>([
    {
      id: '1',
      type: 'inputNode',
      position: { x: 100, y: 100 },
      data: { label: 'المدخلات', type: 'input' }
    },
    {
      id: '2',
      type: 'processNode',
      position: { x: 300, y: 100 },
      data: { label: 'المعالجة', type: 'process' }
    },
    {
      id: '3',
      type: 'outputNode',
      position: { x: 500, y: 100 },
      data: { label: 'المخرجات', type: 'output' }
    }
  ]);
  
  const [edges, setEdges] = useState<Edge[]>([
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' }
  ]);
  
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState<CubeNodeData['type']>('process');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onNodesChange = useCallback(
    (changes: any) => {
      setNodes((nds) => {
        const updatedNodes = nds.map(node => {
          const change = changes.find((c: any) => c.id === node.id);
          if (change && change.type === 'position' && change.position) {
            return { ...node, position: change.position };
          }
          return node;
        });
        
        // تحديث Cube إذا كان هناك تغيير
        if (cube) {
          const updatedCube = {
            ...cube,
            workflow: updatedNodes.map(node => ({
              id: node.id,
              type: node.data.type,
              label: node.data.label,
              position: node.position,
              config: node.data.config
            }))
          };
          onUpdate(updatedCube);
        }
        
        return updatedNodes;
      });
    },
    [cube, onUpdate]
  );

  const addNode = () => {
    if (!newNodeLabel.trim()) return;
    
    const newNodeId = `node_${Date.now()}`;
    const newNode: Node<CubeNodeData> = {
      id: newNodeId,
      type: `${newNodeType}Node` as any,
      position: { x: 250, y: 250 },
      data: { 
        label: newNodeLabel, 
        type: newNodeType,
        config: {}
      }
    };
    
    setNodes([...nodes, newNode]);
    setNewNodeLabel('');
  };

  const deleteSelectedNode = () => {
    if (!selectedNode) return;
    
    setNodes(nodes.filter(node => node.id !== selectedNode.id));
    setEdges(edges.filter(
      edge => edge.source !== selectedNode.id && edge.target !== selectedNode.id
    ));
    setSelectedNode(null);
  };

  const saveLayout = () => {
    const layout = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.data.type,
        label: node.data.label,
        position: node.position,
        config: node.data.config
      })),
      edges
    };
    
    // يمكن حفظ التخطيط في قاعدة البيانات
    console.log('Layout saved:', layout);
    
    if (cube) {
      const updatedCube = {
        ...cube,
        workflow: layout.nodes,
        connections: layout.edges
      };
      onUpdate(updatedCube);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">لوحة التصميم</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={saveLayout}>
            حفظ التخطيط
          </Button>
        </div>
      </div>
      
      <div className="flex space-x-4">
        {/* الشريط الجانبي للأدوات */}
        <Card className="w-64">
          <CardContent className="p-4 space-y-4">
            <div>
              <h4 className="font-medium mb-3">إضافة عقدة جديدة</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="node-label">اسم العقدة</Label>
                  <Input
                    id="node-label"
                    value={newNodeLabel}
                    onChange={(e) => setNewNodeLabel(e.target.value)}
                    placeholder="مثل: تحليل النص"
                  />
                </div>
                
                <div>
                  <Label htmlFor="node-type">نوع العقدة</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      type="button"
                      variant={newNodeType === 'input' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewNodeType('input')}
                      className="justify-start"
                    >
                      <Upload className="w-3 h-3 ml-2" />
                      مدخل
                    </Button>
                    <Button
                      type="button"
                      variant={newNodeType === 'output' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewNodeType('output')}
                      className="justify-start"
                    >
                      <Download className="w-3 h-3 ml-2" />
                      مخرج
                    </Button>
                    <Button
                      type="button"
                      variant={newNodeType === 'process' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewNodeType('process')}
                      className="justify-start"
                    >
                      <Cpu className="w-3 h-3 ml-2" />
                      معالجة
                    </Button>
                    <Button
                      type="button"
                      variant={newNodeType === 'ai' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewNodeType('ai')}
                      className="justify-start"
                    >
                      <Code className="w-3 h-3 ml-2" />
                      ذكاء اصطناعي
                    </Button>
                    <Button
                      type="button"
                      variant={newNodeType === 'data' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewNodeType('data')}
                      className="justify-start col-span-2"
                    >
                      <Database className="w-3 h-3 ml-2" />
                      بيانات
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={addNode} 
                  className="w-full"
                  disabled={!newNodeLabel.trim()}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة عقدة
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">العقدة المحددة</h4>
              {selectedNode ? (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="font-medium">{selectedNode.data.label}</div>
                    <div className="text-sm text-gray-500">
                      نوع: {selectedNode.data.type}
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={deleteSelectedNode}
                  >
                    <Trash2 className="w-4 h-4 ml-2" />
                    حذف العقدة
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  اختر عقدة لعرض خصائصها
                </p>
              )}
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">التعليمات</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• اسحب العقد لتغيير موقعها</li>
                <li>• اسحب من نقطة الاتصال للربط</li>
                <li>• انقر على عقدة لتحديدها</li>
                <li>• استخدم الأزرار لإضافة أنواع مختلفة</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        {/* لوحة التدفق */}
        <div className="flex-1" style={{ height: '600px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={setEdges}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            onInit={(instance) => {
              reactFlowInstance.current = instance;
            }}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
      
      {/* معلومات التدفق */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{nodes.length}</div>
              <div className="text-sm text-gray-500">عدد العقد</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{edges.length}</div>
              <div className="text-sm text-gray-500">عدد الاتصالات</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {nodes.filter(n => n.data.type === 'ai').length}
              </div>
              <div className="text-sm text-gray-500">عقد ذكاء اصطناعي</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {nodes.filter(n => n.data.type === 'process').length}
              </div>
              <div className="text-sm text-gray-500">عقد معالجة</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}