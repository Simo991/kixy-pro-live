
import { useState, useRef } from 'react';

export default function Home(){
  const [url,setUrl] = useState('');
  const [status,setStatus] = useState('');
  const [progress,setProgress] = useState(0);
  const [clips,setClips] = useState([]);
  const [videoInfo,setVideoInfo] = useState(null);
  const [loading,setLoading] = useState(false);
  const [log,setLog] = useState([]);

  const addLog = (m) => setLog(l=>[...l, `> ${m}`]);

  const handleProcess = async () => {
    if(!url) return alert('حط رابط يوتيوب');
    setLoading(true); setClips([]); setLog([]); setProgress(0);
    try{
      addLog('🔍 كنستخرج معلومات الفيديو...');
      setStatus('جاري تحليل الفيديو...');
      setProgress(10);

      // Call backend
      addLog('📥 كنحمّل الفيديو من يوتيوب داخل السيرفر...');
      setStatus('تحميل الفيديو من يوتيوب...');
      setProgress(30);

      const res = await fetch('/api/process-youtube', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({url, clipCount:10})
      });

      if(!res.ok){
        const err = await res.json();
        throw new Error(err.error||'فشل المعالجة');
      }

      addLog('🎬 كنقص 10 مقاطع عمودية 9:16...');
      setStatus('تقطيع المقاطع...');
      setProgress(70);

      const data = await res.json();
      setVideoInfo(data.videoInfo);
      setClips(data.clips);

      setProgress(100);
      setStatus('واجدين! ✅');
      addLog(`✅ واجدين ${data.clips.length} مقاطع!`);

    }catch(e){
      addLog(`❌ خطأ: ${e.message}`);
      setStatus('فشل: '+e.message);
      alert(e.message);
    }finally{
      setLoading(false);
    }
  };

  const downloadAll = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    for(let i=0;i<clips.length;i++){
      const c = clips[i];
      const base64Data = c.videoBase64.split(',')[1];
      zip.file(`clip_${i+1}_${c.hook.slice(0,10)}.mp4`, base64Data, {base64:true});
    }
    const content = await zip.generateAsync({type:'blob'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'kixy_clips.zip';
    a.click();
  };

  return (
    <div dir="rtl" style={{fontFamily:'Cairo, sans-serif', background:'#0a0a0a', color:'white', minHeight:'100vh'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');`}</style>

      <header style={{borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'16px 24px', display:'flex', justifyContent:'space-between'}}>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <div style={{width:32,height:32,background:'white',color:'black',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900}}>K</div>
          <span style={{fontWeight:900, fontSize:20}}>KIXY PRO LIVE</span>
          <span style={{background:'rgba(34,197,94,0.2)',color:'#4ade80',fontSize:10,padding:'4px 8px',borderRadius:20,border:'1px solid rgba(34,197,94,0.3)'}}>● حي 100%</span>
        </div>
      </header>

      <main style={{maxWidth:1100, margin:'0 auto', padding:'48px 24px'}}>
        <div style={{textAlign:'center', marginBottom:48}}>
          <h1 style={{fontSize:48, fontWeight:900, lineHeight:1.1}}>حول الفيديوهات الطويلة<br/><span style={{color:'rgba(255,255,255,0.4)'}}>إلى مقاطع تربح</span></h1>
          <p style={{color:'rgba(255,255,255,0.6)', marginTop:16}}>لصق رابط يوتيوب - السيرفر كيجيب الفيديو ويقسمو لـ10 مقاطع عمودية بحال kixy.ai تماما</p>
        </div>

        <div style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, padding:24, marginBottom:32}}>
          <div style={{display:'flex', gap:12}}>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=... أو youtu.be/..." style={{flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'16px 20px', color:'white', outline:'none'}}/>
            <button onClick={handleProcess} disabled={loading} style={{background:'white', color:'black', fontWeight:700, padding:'16px 32px', borderRadius:12, opacity:loading?0.5:1}}>{loading?'كيخدم...':'حوّل الآن - حي'}</button>
          </div>
        </div>

        {status && (
          <div style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:24, marginBottom:32}}>
            <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:16}}><div style={{width:8,height:8,background:'#4ade80',borderRadius:'50%'}}></div><span style={{fontWeight:700}}>{status}</span></div>
            <div style={{width:'100%', background:'rgba(255,255,255,0.1)', borderRadius:10, height:8, overflow:'hidden'}}><div style={{height:'100%', background:'white', width:`${progress}%`, transition:'width 0.3s'}}></div></div>
            <div style={{marginTop:16, fontSize:12, color:'rgba(255,255,255,0.5)', fontFamily:'monospace'}}>{log.map((l,i)=><div key={i}>{l}</div>)}</div>
          </div>
        )}

        {clips.length>0 && (
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
              <h2 style={{fontSize:24, fontWeight:700}}>واجدين! {clips.length} مقاطع - حي</h2>
              <button onClick={downloadAll} style={{background:'white', color:'black', fontWeight:700, padding:'12px 24px', borderRadius:12}}>تحميل الكل ZIP</button>
            </div>
            {videoInfo && <div style={{marginBottom:24, color:'rgba(255,255,255,0.6)'}}>🎬 {videoInfo.title} - {Math.round(videoInfo.duration/60)} دقيقة</div>}
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16}}>
              {clips.map(c=>(
                <div key={c.id} style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, overflow:'hidden'}}>
                  <div style={{aspectRatio:'9/16', background:'black', position:'relative'}}>
                    <video src={c.videoBase64} controls style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    <div style={{position:'absolute',top:8,left:8,background:'rgba(0,0,0,0.7)',color:'white',fontSize:10,padding:'4px 8px',borderRadius:6}}>{c.score}/10</div>
                    <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,black)',padding:12}}>
                      <div style={{fontSize:12,fontWeight:700}}>{c.hook}</div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,0.6)'}}>{c.start}s • {c.size}MB</div>
                    </div>
                  </div>
                  <div style={{padding:12, display:'flex', gap:8}}>
                    <a href={c.videoBase64} download={`clip_${c.id+1}.mp4`} style={{flex:1,background:'white',color:'black',fontSize:12,fontWeight:700,padding:'8px',borderRadius:8,textAlign:'center',textDecoration:'none'}}>تحميل MP4</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{marginTop:64, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:32}}>
          <h3 style={{fontWeight:700, marginBottom:16}}>كيف كيخدم الموقع الحي؟</h3>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.6)', lineHeight:1.8}}>
            <p>✅ المستخدم يلصق رابط يوتيوب</p>
            <p>✅ السيرفر كيحمل الفيديو بـ ytdl-core (كيخدم مع جميع فيديوهات يوتيوب)</p>
            <p>✅ ffmpeg كيقص 10 مقاطع عمودية 9:16 مع Hook Overlay</p>
            <p>✅ كل مقطع فيديو حقيقي MP4 قابل للتحميل - بحال kixy.ai تماما</p>
            <p style={{marginTop:16, color:'#4ade80'}}>هذا هو الحل الوحيد اللي كيخدم 100% - خاص سيرفر، ما يمكنش غير بالمتصفح حيث يوتيوب كيبلوكي التحميل من المتصفح (CORS).</p>
          </div>
        </div>
      </main>
    </div>
  )
}
