const assert=require('node:assert/strict');
const {compileStrapi,createStrapi}=require('@strapi/strapi');
const stripIds=value=>JSON.stringify(value,(key,item)=>key==='id'?undefined:item);
async function main(){
 const app=createStrapi(await compileStrapi());
 await app.load();
 const uid='api::homepage.homepage';
 const populate={
  hero:{populate:{trustedClients:{populate:{logo:true}},backgroundImage:true,backgroundVideo:true,primaryCta:true}},
  portfolioProofPoints:{populate:{metrics:true,backgroundLeft:true,backgroundRight:true}},
  capitalEfficiency:{populate:{backgroundImage:true,benefits:{populate:{icon:true,artwork:true}}}},
  capitarDifference:{populate:{cta:true,cardBackground:true,items:{populate:{image:true}}}},
 };
 let original,documentId;
 try {
  const home=await app.documents(uid).findFirst({status:'published',populate});
  documentId=home.documentId;
  const difference=home.capitarDifference;
  assert.equal(difference.sectionLabel,'THE CAPITAR DIFFERENCE');
  assert.equal(difference.items.length,4);
  assert.equal(difference.cta.enabled,false);
  const {label,href,enabled,showIndicator}=difference.cta;
  original={enabled:difference.enabled,sectionLabel:difference.sectionLabel,heading:difference.heading,description:difference.description,
   cta:{label,href,enabled,showIndicator},cardBackground:difference.cardBackground.id,
   items:difference.items.map(({number,title,description,image})=>({number,title,description,image:image?.id})),
  };
  for(const item of difference.items){assert.ok(item.image.url.startsWith('/uploads/'));assert.ok(item.image.alternativeText);}
  const previous=stripIds([home.hero,home.portfolioProofPoints,home.capitalEfficiency]);
  const write=data=>app.documents(uid).update({documentId,status:'published',data:{capitarDifference:JSON.parse(JSON.stringify(data))}});
  await write({...original,enabled:false,heading:'CMS verification heading',items:[...original.items].reverse()});
  const updated=await app.documents(uid).findFirst({status:'published',populate});
  assert.equal(updated.capitarDifference.enabled,false);
  assert.equal(updated.capitarDifference.heading,'CMS verification heading');
  assert.equal(updated.capitarDifference.items[0].number,'04');
  assert.equal(stripIds([updated.hero,updated.portfolioProofPoints,updated.capitalEfficiency]),previous);
  await write({...original,description:null,cardBackground:null,items:original.items.map(item=>({...item,image:null}))});
  const optional=await app.documents(uid).findFirst({status:'published',populate});
  assert.equal(optional.capitarDifference.cardBackground,null);
  assert.equal(optional.capitarDifference.items[0].image,null);
  console.log('Phase 4 CMS publication/edit/disable/reorder/optional media checks passed. All three existing sections preserved.');
 } finally {
  try {if(original&&documentId) await app.documents(uid).update({documentId,status:'published',data:{capitarDifference:JSON.parse(JSON.stringify(original))}});}
  finally {await new Promise(resolve=>setTimeout(resolve,1000));await app.destroy();}
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
