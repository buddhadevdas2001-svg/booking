(async()= r=await fetch('http://localhost:3000');console.log('STATUS',r.status);}catch(e){console.error('ERR',e.message);process.exit(1);}})(); 
