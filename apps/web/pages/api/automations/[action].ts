// apps/web/pages/api/automations/[action].ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { action } = req.query;

  switch (action) {
    case 'trigger':
      await triggerAutomation(req.body);
      break;
    
    case 'status':
      const status = await getAutomationStatus();
      res.json(status);
      break;
    
    case 'test':
      await testAutomationFlow(req.body.flowId);
      break;
    
    default:
      res.status(404).json({ error: 'Action not found' });
  }
}

async function triggerAutomation(data: any) {
  // تشغيل Cloudinary MediaFlow عبر API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CLOUDINARY_AUTOMATION_URL}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CLOUDINARY_API_SECRET}`
      },
      body: JSON.stringify({
        flow_id: data.flowId,
        input: data.input,
        webhook_url: `${process.env.NEXTAUTH_URL}/api/cloudinary/webhook`
      })
    }
  );

  return response.json();
}