export default function PricingPage() {
  const plans = [
    {
      name: 'Basic',
      price: '$29',
      features: ['Up to 5 projects', 'Basic support', '1GB storage']
    },
    {
      name: 'Pro',
      price: '$99',
      features: ['Up to 50 projects', 'Priority support', '50GB storage', 'Advanced analytics']
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: ['Unlimited projects', '24/7 support', '1TB storage', 'Custom integrations']
    }
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '48px', textAlign: 'center', marginBottom: '20px' }}>
        Pricing Plans
      </h1>
      <p style={{ textAlign: 'center', fontSize: '18px', marginBottom: '60px', color: '#666' }}>
        Choose the perfect plan for your business needs
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '30px' 
      }}>
        {plans.map((plan, index) => (
          <div key={index} style={{
            padding: '30px',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            background: index === 1 ? '#f8f9ff' : 'white'
          }}>
            <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>{plan.name}</h3>
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>
              {plan.price}
              {plan.price !== 'Custom' && <span style={{ fontSize: '16px', color: '#666' }}>/month</span>}
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px' }}>
              {plan.features.map((feature, i) => (
                <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  ✓ {feature}
                </li>
              ))}
            </ul>
            
            <button style={{
              width: '100%',
              padding: '15px',
              background: index === 1 ? '#0070f3' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}>
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
