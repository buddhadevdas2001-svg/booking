(async () => {
    console.log('Testing APIs on http://localhost:3000...');
    
    // 1. Search API
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    console.log(`\n1. Testing /api/search?origin=Dhaka&destination=Chittagong&date=${dateStr}`);
    try {
        const res = await fetch(`http://localhost:3000/api/search?origin=Dhaka&destination=Chittagong&date=${dateStr}`);
        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log(`Response Check: ${Array.isArray(data) ? `Found ${data.length} buses` : 'Passed but not array'}`);
    } catch(err) {
        console.error('Failed to fetch search API:', err);
    }

    // 2. Locations API
    console.log(`\n2. Testing /api/locations`);
    try {
        const res = await fetch(`http://localhost:3000/api/locations`);
        console.log(`Status: ${res.status}`);
        if(res.headers.get('content-type')?.includes('application/json')) {
           const data = await res.json();
           console.log(`Response Check: Found ${data.length} locations`);
        } else {
           const text = await res.text();
           console.log(`Response Check: ${text.substring(0, 50)}...`);
        }
    } catch(err) {
        console.error('Failed to fetch locations:', err);
    }

})();
