const fs=require('fs'),vm=require('vm'),assert=require('assert');
const nodes=new Map();
const node=()=>({innerHTML:'',textContent:'',hidden:false,setAttribute(){},classList:{toggle(){}}});
const context={console,document:{documentElement:{dataset:{}},querySelector:s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)},querySelectorAll:()=>[]},fetch:async()=>({ok:true,json:async()=>[]})};
vm.createContext(context);vm.runInContext(fs.readFileSync('web/app.js','utf8'),context);
setImmediate(()=>{
const result=vm.runInContext(`(()=>{
const now=new Date(2026,9,20);
if(deadlineWindow('week',now).end!=='2026-10-25')throw Error('Week must end Sunday');
if(deadlineWindow('fortnight',now).end!=='2026-11-01')throw Error('Two weeks must cross month boundary');
if(deadlineWindow('month',now).end!=='2026-10-31')throw Error('Month end incorrect');
if(deadlineWindow('week',new Date(2026,9,25)).end!=='2026-10-25')throw Error('Sunday boundary incorrect');
if(deadlineWindow('month',new Date(2028,1,10)).end!=='2028-02-29')throw Error('Leap year incorrect');
if(validDeadline('2026-02-30')||validDeadline('nonsense'))throw Error('Invalid date accepted');
projects=[{id:'p',title:'Project',category:'work',stage:'In development',date:'2026-10-25',tasks:[{title:'Overdue',date:'2026-10-19'},{title:'Today',date:'2026-10-20'},{title:'Done',done:true,date:'2026-10-20'},{title:'Later',date:'2026-10-30'},{title:'Undated'},{title:'Invalid',date:'2026-02-30'}]},{id:'c',title:'Completed',stage:'Completed for now',date:'2026-10-22',tasks:[]}];
let rows=deadlineEntries('week',now);
if(rows.map(e=>e.item.title).join('|')!=='Overdue|Today|Project')throw Error('Ordering, inclusive boundary or completion exclusion failed');
if(deadlineEntries('month',now).length!==4)throw Error('Month missing later task');
query='today';if(deadlineEntries('week',now).length!==1)throw Error('Task search failed');query='';filter='personal';if(deadlineEntries('week',now).length)throw Error('Category filter failed');filter='';
workspace='deadlines';render();if(!document.querySelector('#projects').hidden||document.querySelector('#deadline-view').hidden)throw Error('Dedicated view not switched');
workspace='active';render();if(document.querySelector('#deadline-preview').hidden||document.querySelector('#projects').hidden)throw Error('Home preview not shown');
return true;
})()`,context);
assert(result);console.log('Passed: deadline calendar boundaries, sorting, completion, filters and views');
});
