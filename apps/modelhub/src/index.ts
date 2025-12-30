import Fastify from 'fastify';
import { CubeManager } from './core/manager';
import { FaceRecognitionCube } from './cubes/vision/FaceRecognition';
import cubeRoutes from './api/routes/cubes';
import { SalesOutlookAutomationCube } from './cubes/integration/SalesOutlookAutomation';

async function initializeCubes() {
  const cubeManager = new CubeManager();
  
  // تسجيل مكعب أتمتة المبيعات
  const salesCube = new SalesOutlookAutomationCube();
  await cubeManager.registerCube(salesCube);
  
  console.log('✅ Sales Outlook Automation cube registered');
}

export class ModelHub {
  private fastify = Fastify({ logger: true });
  private cubeManager = new CubeManager();
  
  constructor() {
    this.setupRoutes();
    this.registerDefaultCubes();
  }
  
  private setupRoutes() {
    // تسجيل مسارات API
    this.fastify.register(cubeRoutes, { prefix: '/api/v1/cubes' });
    
    // مسارات الصحة
    this.fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date() }));
  }
  
  private async registerDefaultCubes() {
    // تسجيل المكعبات الافتراضية
    const defaultCubes = [
      new FaceRecognitionCube(),
      // أضف مكعبات أخرى هنا
    ];
    
    for (const cube of defaultCubes) {
      await this.cubeManager.registerCube(cube);
    }
  }
  
  async start(port = 3001) {
    try {
      await this.fastify.listen({ port, host: '0.0.0.0' });
      console.log(`🚀 ModelHub running on port ${port}`);
    } catch (err) {
      this.fastify.log.error(err);
      process.exit(1);
    }
  }
}

// تشغيل الخدمة إذا تم تشغيل الملف مباشرة
if (require.main === module) {
  const modelHub = new ModelHub();
  modelHub.start();
}

export { CubeManager, FaceRecognitionCube };