export interface ExcelData {
  headers: string[];
  rows: any[][];
  title?: string;
}

export async function generateExcel(data: ExcelData): Promise<string> {
  try {
    console.log('Generating Excel report:', data.title || 'Untitled');
    
    // Simulate Excel generation
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return `/exports/${data.title || 'report'}-${Date.now()}.xlsx`;
  } catch (error) {
    console.error('Excel generation failed:', error);
    throw new Error('Failed to generate Excel');
  }
}

export default generateExcel;
